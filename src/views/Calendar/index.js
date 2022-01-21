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
        formFields: {
          required: {
            type: 'email',
            label: 'Correo',
            required: true,
            value: ''
          },
          custom: []
        }
      },
      currentTab: 0,
      selectedDay: {},
      selectedHour: {},
      availableHours: [],
      meetData: { hangoutLink: '', summary: '' },
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
    selectHour (hour) {
      this.selectedHour = hour
      this.currentTab = 2
    },
    async handleForm () {
      this.loading.creatingEvent = true
      try {
        if (this.calendarInfo.formFields.required.value === '') {
          this.loading.creatingEvent = false
          return
        }
        this.calendarInfo.createdAt = new Date()
        const { meetData, eventData } = await $calendar.insertMeeting(
          this.calendarInfo,
          this.selectedHour
        )
        this.meetData = meetData
        const { data: lead } = await $pimex.addLead({
          _state: 'lead',
          name: this.calendarInfo.formFields.required.value.split('@')[0],
          phone: '',
          email: this.calendarInfo.formFields.required.value,
          project: this.calendarInfo.board.id,
          referrer: 'Calendar',
          origin: 'Calendar'
          // _compare: false
        })
        await $calendar.updateMeeting({ ...eventData, leadId: lead.ID })
        await $pimex.addLeadTask(
          lead.ID,
          this.calendarInfo,
          this.selectedHour,
          this.meetData
        )
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
      this.calendarInfo = await $calendar.getCalendarById(
        this.$route.params.boardName,
        this.$route.params.eventId
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
