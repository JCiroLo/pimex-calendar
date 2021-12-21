import request from 'axios'

const CLIENT_SECRET = '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'
const CLIENT_ID =
  '317489015607-flqqe7a1gk2akeqtmt5lmkd5ic4pvmgo.apps.googleusercontent.com'
const API_KEY = 'AIzaSyDOEFLx36RJE5NijrTGJE12beIsv99VnEc'
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
]
const SCOPES = 'https://www.googleapis.com/auth/calendar'

const calendar = {}

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
  console.log(data)
  const {
    board,
    createdAt,
    days,
    hours,
    image,
    months,
    owner,
    updatedAt,
    id,
    ...filteredCalendarInfo
  } = calendarInfo
  const res = await window.db.collection('events').add({
    calendarId: id,
    boardInfo: board,
    selectedDate: selectedHour,
    state: 'Agendado',
    meetLink: data.hangoutLink,
    metadata: filteredCalendarInfo,
    meetId: data.id
  })
  return { eventId: res.id, ...data }
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

export default calendar
