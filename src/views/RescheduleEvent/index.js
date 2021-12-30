import $calendar from '../../services/calendar'
import $pimex from '../../services/pimex'
import meetIcon from '../../assets/meet_icon.png'

export default {
  name: 'Calendar',
  data () {
    return {
      loading: {
        calendar: true,
        hours: false,
        creatingEvent: false
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
      eventData: { hangoutLink: '', summary: '' },
      leadData: {},
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
      const hour = date.getHours()
      const meridiem = hour >= 12 ? 'PM' : 'AM'
      const hourWithZeros = $calendar.padHour(2, ((hour + 11) % 12) + 1)
      const minutesWithZeros = $calendar.padHour(2, date.getMinutes())
      return `${hourWithZeros}:${minutesWithZeros} ${meridiem}`
    }
  },
  methods: {
    getAvaiableDates () {
      const range = {
        from: new Date(this.calendarInfo.months.from.seconds * 1000),
        to: new Date(this.calendarInfo.months.to.seconds * 1000 - 1)
      }
      if (new Date().getTime() > range.from.getTime()) {
        range.from = new Date()
      }
      return range
    },
    async getAvaiableHours () {
      try {
        const { access_token } = await $calendar.getAccesToken(
          this.calendarInfo.owner.email
        )
        this.availableHours = await $calendar.getAvaiableHours(
          access_token,
          this.selectedDay,
          this.calendarInfo.hours,
          this.calendarInfo.duration
        )
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
      await this.getAvaiableHours()
      this.currentTab = 1
      this.loading.hours = false
    },
    async selectHour (hour) {
      this.loading.creatingEvent = true
      this.selectedHour = hour
      this.eventData.selectedDate = hour
      try {
        const { access_token } = await $calendar.getAccesToken(
          this.calendarInfo.owner.email
        )
        await $calendar.rescheduleMeetEvent(this.eventData, access_token)
        await $calendar.updateEvent(this.eventData)
        this.currentTab++
        this.loading.creatingEvent = false
      } catch (e) {
        console.log(e)
        this.error.state = true
        this.error.message = 'Ha ocurrido un error'
        this.loading.creatingEvent = false
      }
    },
    goBack () {
      this.currentTab--
    }
  },
  async beforeMount () {
    try {
      this.leadData = await $pimex.getLead(this.$route.params.leadId)
      this.eventData = await $calendar.getEvent(this.leadData.custom.eventId)
      this.calendarInfo = await $calendar.getCalendar(
        this.eventData.boardInfo.name,
        this.eventData.calendarId
      )
    } catch (e) {
      this.error.state = true
      this.error.message = 'El evento no está disponible'
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
