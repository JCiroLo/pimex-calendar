import request from 'axios'

const CLIENT_ID =
  '668702922045-18etcjcu2sordaudhddgcpki5vak72um.apps.googleusercontent.com'
const API_KEY = 'AIzaSyAgreAVYTzJ6tr1jCljleaHfuLhGcGlpqc'
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
]
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly'

const calendar = {}

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
      client_id:
        '668702922045-18etcjcu2sordaudhddgcpki5vak72um.apps.googleusercontent.com',
      refresh_token: tokenRef.data().token,
      client_secret: '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',
      grant_type: 'refresh_token'
    }
  })

  return data
}

calendar.insertEvent = async (
  accessToken,
  insertDate,
  { title },
  email,
  boardInfo
) => {
  const { data } = await request.post(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all&conferenceDataVersion=1',
    {
      summary: title,
      location: '',
      start: {
        dateTime: new Date(insertDate.start).toISOString()
      },
      end: {
        dateTime: new Date(insertDate.end).toISOString()
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
  return data
}

calendar.getEvent = async (boardName, eventId) => {
  const eventRef = await window.db
    .collection('calendars')
    .doc(eventId)
    .get()
  if (!eventRef.exists) {
    throw 'Error'
  }
  return eventRef.data()
}

calendar.getAvaiableHours = async (accessToken, day, hours, duration) => {
  const [hourF, minF, secF] = hours.from.split(':')
  const [hourT, minT, secT] = hours.to.split(':')

  const range = {
    items: [{ id: 'primary', busy: 'Active' }],
    timeMin: new Date(
      day.year,
      day.month - 1,
      day.day,
      parseInt(hourF),
      parseInt(minF),
      parseInt(secF)
    ).toISOString(),
    timeMax: new Date(
      day.year,
      day.month - 1,
      day.day,
      parseInt(hourT),
      parseInt(minT),
      parseInt(secT)
    ).toISOString()
  }

  const { data } = await request.post(
    'https://www.googleapis.com/calendar/v3/freeBusy?key=AIzaSyAgreAVYTzJ6tr1jCljleaHfuLhGcGlpqc',
    range,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    }
  )

  const calendarHours = data.calendars.primary.busy

  let auxHour = new Date(
    day.year,
    day.month - 1,
    day.day,
    parseInt(hourF),
    parseInt(minF),
    parseInt(secF)
  ).getTime()

  const maxHour = new Date(
    day.year,
    day.month - 1,
    day.day,
    parseInt(hourT),
    parseInt(minT),
    parseInt(secT)
  ).getTime()

  const durationInMilliseconds =
    duration.type === 'minutes'
      ? 1000 * 60 * duration.time
      : 1000 * 60 * 60 * duration.time

  const availableHours = []

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
      availableHours.push({ start: new Date(auxHour), end: new Date(nextHour) })
    }
    auxHour = nextHour
  }

  return availableHours
}

export default calendar
