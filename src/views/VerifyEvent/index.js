import $calendar from '../../services/calendar'
import $messages from '../../services/messages'

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
      const meetingData = await $calendar.getMeetingById(
        this.$route.params.meetingId
      )
      const calendarData = await $calendar.getCalendarById(
        meetingData.boardInfo.name,
        meetingData.calendarId
      )
      if (meetingData.state === 'Agendado') {
        await $calendar.updateMeetingState(
          this.$route.params.meetingId,
          'Confirmado'
        )
        await $messages.sendEmail(calendarData, meetingData, 'verify')
      } else {
        this.error = {
          state: true,
          message: 'El evento ha sido previamente confirmado o cancelado.'
        }
      }
      this.loading = false
    } catch ({ response }) {
      if (response.status === 404) {
        this.error.state = true
        this.error.message = 'El evento no existe'
      } else {
        this.error = {
          state: true,
          message: 'Ha ocurrido un error, inténtelo de nuevo.'
        }
      }
      this.loading = false
    }
  }
}
