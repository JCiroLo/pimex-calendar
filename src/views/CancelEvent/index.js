import $pimex from '../../services/pimex'
import $calendar from '../../services/calendar'

export default {
  name: 'CancelEvent',
  data () {
    return {
      loading: true,
      eventState: '',
      error: {
        state: false,
        message: ''
      }
    }
  },
  async beforeMount () {
    try {
      const leadData = await $pimex.getLead(this.$route.params.leadId)
      const eventData = await $calendar.getEvent(leadData.custom.eventId)
      const calendarData = await $calendar.getCalendar(
        eventData.boardInfo.name,
        eventData.calendarId
      )
      const { access_token } = await $calendar.getAccesToken(
        calendarData.owner.email
      )
      if (eventData.state === 'Agendado') {
        await $calendar.updateEventState(leadData.custom.eventId, 'Cancelado')
        await $calendar.cancelMeetEvent(eventData.meetId, access_token)
      } else {
        this.error = {
          state: true,
          message: 'El evento ha sido previamente confirmado o cancelado.'
        }
      }
      this.loading = false
    } catch (e) {
      console.log(e)
      this.error = {
        state: true,
        message: 'Ha ocurrido un error, inténtelo de nuevo.'
      }
      this.loading = false
    }
  }
}
