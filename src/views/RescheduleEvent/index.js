import $calendar from '../../services/calendar'
import $messages from '../../services/messages'
import meetIcon from '../../assets/meet_icon.png'

export default {
  name: 'Calendar',
  data () {
    return {
      loading: {
        calendar: true,
        hours: false,
        updatingEvent: false
      },
      error: { state: false, message: '' },
      calendarInfo: {
        title: '',
        subtitle: '',
        duration: { time: '', type: 'minutes' },
        description: '',
        color: '',
        months: {
          from: '',
          to: ''
        },
        days: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false
        },
        hours: {
          from: '',
          to: ''
        },
        image: {
          name: '',
          url: ''
        },
        board: {
          name: '',
          id: ''
        },
        formFields: []
      },
      eventData: {},
      googleMeetingData: {},
      currentTab: 0,
      selectedDay: {},
      selectedHour: {},
      availableHours: [],
      meetIcon
    }
  },
  computed: {
    disabledDates () {
      const disabledDays = []
      Object.keys(this.calendarInfo.days).forEach(day => {
        if (day === 'monday' && !this.calendarInfo.days[day]) {
          disabledDays.push(2)
        } else if (day === 'tuesday' && !this.calendarInfo.days[day]) {
          disabledDays.push(3)
        } else if (day === 'wednesday' && !this.calendarInfo.days[day]) {
          disabledDays.push(4)
        } else if (day === 'thursday' && !this.calendarInfo.days[day]) {
          disabledDays.push(5)
        } else if (day === 'friday' && !this.calendarInfo.days[day]) {
          disabledDays.push(6)
        } else if (day === 'saturday' && !this.calendarInfo.days[day]) {
          disabledDays.push(7)
        } else if (day === 'sunday' && !this.calendarInfo.days[day]) {
          disabledDays.push(1)
        }
      })
      return disabledDays
    },
    sortedAvaiableHours () {
      let sortedAvailableHours = this.availableHours
      sortedAvailableHours.sort(function (a, b) {
        return a.start - b.start
      })
      return sortedAvailableHours
    }
  },
  filters: {
    formatDuration ({ time, type }) {
      if (time === 1 && type === 'minutes') return '1 Minuto'
      else if (time === 1 && type === 'hours') return '1 Hora'
      else {
        if (type === 'minutes') {
          return `${time} Minutos`
        } else {
          return `${time} Horas`
        }
      }
    },
    formatHour (date) {
      const hour = new Date(date).getHours()
      const minutes = new Date(date).getMinutes()
      const meridiem = hour >= 12 ? 'PM' : 'AM'
      const hourWithZeros = $calendar.padHour(2, ((hour + 11) % 12) + 1)
      const minutesWithZeros = $calendar.padHour(2, minutes)
      return `${hourWithZeros}:${minutesWithZeros} ${meridiem}`
    }
  },
  methods: {
    getAvaiableDates () {
      const range = {
        from: new Date(this.calendarInfo.months.from),
        to: new Date(new Date(this.calendarInfo.months.to).getTime() - 1)
      }
      if (new Date().getTime() > range.from.getTime()) {
        range.from = new Date()
      }
      return range
    },
    async getAvaiableHours () {
      try {
        const availableHours = await $calendar.getAvaiableHours(
          this.calendarInfo,
          this.selectedDay
        )
        return availableHours
      } catch (e) {
        this.error.state = true
        this.error.message = 'Ha ocurrido un error'
      }
    },
    async selectDay (day) {
      if (day.isDisabled) {
        return
      }
      this.loading.hours = true
      this.selectedDay = day
      this.availableHours = await this.getAvaiableHours()
      this.currentTab = 1
      this.loading.hours = false
    },
    async selectHour (hour) {
      this.loading.updatingEvent = true
      this.selectedHour = hour
      this.eventData.selectedDate = hour
      try {
        // Update google meeting info
        this.googleMeetingData = await $calendar.rescheduleGoogleMeetEvent(
          this.eventData,
          this.calendarInfo
        )
        // Update pimex meeting info
        await $calendar.updateMeeting(this.eventData)
        // Get pimex meeting info (to update timestamps)
        this.eventData = await $calendar.getMeetingById(
          this.$route.params.meetingId
        )
        // Send email to attendee
        await $messages.sendEmail(
          this.calendarInfo,
          this.eventData,
          'reschedule'
        )
        this.currentTab++
        this.loading.updatingEvent = false
      } catch (e) {
        console.log(e)
        this.error.state = true
        this.error.message = 'Ha ocurrido un error'
        this.loading.updatingEvent = false
      }
    },
    goBack () {
      this.currentTab--
    }
  },
  async beforeMount () {
    try {
      this.eventData = await $calendar.getMeetingById(
        this.$route.params.meetingId
      )
      this.calendarInfo = await $calendar.getCalendarById(
        this.eventData.boardInfo.name,
        this.eventData.calendarId
      )
    } catch ({ response }) {
      if (response.status === 404) {
        this.error.state = true
        this.error.message = 'El evento no existe'
      } else {
        this.error.state = true
        this.error.message = 'El evento no está disponible'
      }
    }
    if (
      new Date().getTime() >
      new Date(this.calendarInfo.months.to.seconds * 1000).getTime()
    ) {
      this.error.state = true
      this.error.message = 'Este evento expiró'
    }
    this.loading.calendar = false
  }
}
