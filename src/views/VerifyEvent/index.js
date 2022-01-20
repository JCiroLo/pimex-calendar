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
      await $calendar.updateMeetingState(
        this.$route.params.meetingId,
        'Confirmado'
      )
    } catch ({ response }) {
      if (response.status === 404) {
        this.error = {
          state: true,
          message: 'El evento no existe.'
        }
      } else if (response.status === 405) {
        this.error = {
          state: true,
          message: 'El evento ha sido previamente confirmado o cancelado.'
        }
      } else {
        this.error = {
          state: true,
          message: 'Ha ocurrido un error, inténtelo de nuevo.'
        }
      }
    }
    this.loading = false
  }
}
