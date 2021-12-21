import $pimex from '../../services/pimex'
import $calendar from '../../services/calendar'

export default {
  name: 'VerifyEvent',
  data () {
    return {
      loading: true,
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
      if (eventData.state === 'Agendado') {
        await $calendar.updateEventState(leadData.custom.eventId, 'Confirmado')
      } else {
        this.error = {
          state: true,
          message: 'El evento ha sido previamente confirmado o cancelado.'
        }
      }
      this.loading = false
    } catch (e) {
      this.error = {
        state: true,
        message: 'Ha ocurrido un error, inténtelo de nuevo.'
      }
      this.loading = false
    }
  }
}
