import request from 'axios'

const CLIENT_SECRET = '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'
const CLIENT_ID =
  '692108657923-2uafkdn3a59umaqrb8na4nrhp2r9r96e.apps.googleusercontent.com'
const API_KEY = 'AIzaSyD9wys0UKAbFqlCEnrTIKGl3G1nmkPMLRs'
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
]
const SCOPES = 'https://www.googleapis.com/auth/calendar'

const calendar = {}

const getFormFieldsEmail = formFields => {
  const [correo] = formFields.filter(f => f.type === 'email')
  return correo
}

const getRangeHours = (hours, day) => {
  const from = new Date(hours.from.seconds * 1000)
  const to = new Date(hours.to.seconds * 1000)

  const [hourF, minF, secF] = [
    from.getHours(),
    from.getMinutes(),
    from.getSeconds()
  ]
  const [hourT, minT, secT] = [to.getHours(), to.getMinutes(), to.getSeconds()]

  const timeMin = new Date(day.year, day.month - 1, day.day, hourF, minF, secF)
  const timeMax = new Date(day.year, day.month - 1, day.day, hourT, minT, secT)

  return { timeMin, timeMax }
}

calendar.padHour = (len, n) => {
  return (new Array(len + 1).join('0') + n).slice(-len)
}

calendar.getAccesToken = async ownerEmail => {
  const tokenRef = await window.db
    .collection('calendarUsers')
    .doc(btoa(ownerEmail))
    .get()

  const { data } = await request.request({
    method: 'POST',
    url: 'https://oauth2.googleapis.com/token',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    params: {
      client_id: CLIENT_ID,
      refresh_token: tokenRef.data().token,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token'
    }
  })

  return data
}

calendar.getEvent = async eventId => {
  const eventRef = await window.db
    .collection('events')
    .doc(eventId)
    .get()
  return { id: eventRef.id, ...eventRef.data() }
}

calendar.insertEvent = async (
  accessToken,
  selectedHour,
  calendarInfo,
  email,
  boardInfo
) => {
  const { data } = await request.post(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all&conferenceDataVersion=1',
    {
      summary: calendarInfo.title,
      location: '',
      start: {
        dateTime: new Date(selectedHour.start).toISOString()
      },
      end: {
        dateTime: new Date(selectedHour.end).toISOString()
      },
      conferenceData: {
        createRequest: {
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          },
          requestId: 'some-random-string'
        }
      },
      status: 'confirmed',
      visibility: 'public',
      attendees: [
        {
          email: email,
          displayName: email.split('@')[0],
          comment: `Desde el tablero ${boardInfo}`
        }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    }
  )
  const res = await window.db.collection('events').add({
    calendarId: calendarInfo.id,
    boardInfo: calendarInfo.board,
    selectedDate: selectedHour,
    meetLink: data.hangoutLink,
    formFields: calendarInfo.formFields,
    meetId: data.id,
    state: 'Agendado',
    leadId: ''
  })
  return {
    meetData: { eventId: res.id, ...data },
    eventData: { id: res.id, ...(await res.get()).data() }
  }
}

calendar.updateEvent = async eventData => {
  const ref = window.db.collection('events').doc(eventData.id)
  delete eventData.id
  await ref.update(eventData)
}

calendar.getCalendar = async (boardName, calendarId) => {
  const eventRef = await window.db
    .collection('calendars')
    .doc(calendarId)
    .get()
  if (!eventRef.exists) {
    throw 'Error'
  }
  return { id: eventRef.id, ...eventRef.data() }
}

calendar.getAvaiableHours = async (accessToken, day, rangeHours, duration) => {
  const availableHours = []
  rangeHours.forEach(async hours => {
    const { timeMin, timeMax } = getRangeHours(hours, day)

    console.log(timeMin, timeMax)

    const range = {
      items: [{ id: 'primary', busy: 'Active' }],
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString()
    }

    const { data } = await request.post(
      `https://www.googleapis.com/calendar/v3/freeBusy?key=${API_KEY}`,
      range,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      }
    )

    const calendarHours = data.calendars.primary.busy

    let { timeMin: auxHour, timeMax: maxHour } = getRangeHours(hours, day)
    auxHour = auxHour.getTime()
    maxHour = maxHour.getTime()

    const durationInMilliseconds =
      duration.type === 'minutes'
        ? 1000 * 60 * duration.time
        : 1000 * 60 * 60 * duration.time

    while (auxHour < maxHour) {
      const nextHour = new Date(auxHour + durationInMilliseconds).getTime()
      let isAvailable = true
      calendarHours.forEach(cHour => {
        const start = new Date(cHour.start).getTime() // Agended event start
        const end = new Date(cHour.end).getTime() // Agended event end
        if (
          (auxHour <= start && start < nextHour) ||
          (auxHour < end && end <= nextHour) ||
          (start <= auxHour && auxHour < end) ||
          (start < nextHour && nextHour <= end)
        ) {
          isAvailable = false
        }
      })
      if (isAvailable) {
        availableHours.push({
          start: new Date(auxHour),
          end: new Date(nextHour)
        })
      }
      auxHour = nextHour
    }
  })
  return availableHours
}

calendar.updateEventState = async (eventId, newState) => {
  const ref = window.db.collection('events').doc(eventId)
  await ref.update({ state: newState })
}

calendar.cancelMeetEvent = async (meetId, accessToken) => {
  await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${meetId}?key=${API_KEY}`,
    {
      method: 'delete',
      headers: new Headers({
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }),
      body: ''
    }
  )
}

calendar.rescheduleMeetEvent = async (eventData, accessToken) => {
  await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventData.meetId}?key=${API_KEY}`,
    {
      method: 'put',
      headers: new Headers({
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }),
      body: JSON.stringify({
        summary: eventData.metadata.title,
        location: '',
        start: {
          dateTime: new Date(eventData.selectedDate.start).toISOString()
        },
        end: {
          dateTime: new Date(eventData.selectedDate.end).toISOString()
        },
        conferenceData: {
          createRequest: {
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            },
            requestId: 'some-random-string'
          }
        },
        status: 'confirmed',
        visibility: 'public'
      })
    }
  )
}

export default calendar
