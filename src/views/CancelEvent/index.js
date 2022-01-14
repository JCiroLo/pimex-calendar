import $messages from '../../services/messages'
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
      const meetingData = await $calendar.getMeetingById(
        this.$route.params.meetingId
      )
      console.log(meetingData)
      const calendarData = await $calendar.getCalendarById(
        meetingData.boardInfo.name,
        meetingData.calendarId
      )
      if (meetingData.state === 'Agendado') {
        await $calendar.updateMeetingState(
          this.$route.params.meetingId,
          'Cancelado'
        )
        await $calendar.cancelGoogleMeetEvent(
          meetingData.meetId,
          calendarData.owner.email
        )
        await $messages.sendEmail(calendarData, meetingData, 'cancel')
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
        this.loading = false
      }
    }
  }
}
