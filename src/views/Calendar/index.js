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
      error: false,
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
      currentTab: 0,
      selectedDay: {},
      selectedHour: {},
      avaiableHours: [],
      authorized: false,
      items: undefined,
      googleAuth: '',
      refresh_code: '',
      resource: {},
      startTime: '',
      endTime: '',
      eventData: { hangoutLink: '', summary: '' },
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
        from: new Date(),
        to: null // new Date(this.calendarInfo.months.to.seconds * 1000)
      }
      if (new Date().getTime() / 1000 < this.calendarInfo.months.from.seconds) {
        range.from = new Date(this.calendarInfo.months.from.seconds * 1000)
      }
      return range
    },
    async getAvaiableHours () {
      const { access_token } = await $calendar.getAccesToken(
        this.calendarInfo.owner.email
      )

      this.avaiableHours = await $calendar.getAvaiableHours(
        access_token,
        this.selectedDay,
        this.calendarInfo.hours,
        this.calendarInfo.duration
      )
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
    selectHour (hour) {
      this.selectedHour = hour
      this.currentTab = 2
    },
    async handleForm () {
      this.loading.creatingEvent = true
      try {
        const [correo] = this.calendarInfo.formFields.filter(
          f => f.type === 'email'
        )
        if (correo.value === '') {
          this.loading.creatingEvent = false
          return
        }
        const { access_token } = await $calendar.getAccesToken(
          this.calendarInfo.owner.email
        )
        this.eventData = await $calendar.insertEvent(
          access_token,
          this.selectedHour,
          this.calendarInfo,
          correo.value,
          this.$route.params.boardName
        )
        const { data: lead } = await $pimex.addLead({
          _state: 'lead',
          name: correo.value.split('@')[0],
          phone: '',
          email: correo.value,
          project: this.calendarInfo.board.id,
          referrer: 'Calendar',
          origin: 'Calendar',
          _compare: false
        })
        await $pimex.addLeadTask(
          lead.ID,
          this.calendarInfo,
          this.selectedHour,
          this.eventData
        )
        this.currentTab++
        this.loading.creatingEvent = false
      } catch (e) {
        this.loading.creatingEvent = false
      }
    },
    goBack () {
      this.currentTab--
    }
  },
  async beforeMount () {
    try {
      this.calendarInfo = await $calendar.getEvent(
        this.$route.params.boardName,
        this.$route.params.eventId
      )
    } catch (e) {
      this.error = true
    }
    this.loading.calendar = false
  }
}