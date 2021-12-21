import request from 'axios'
import config from '../../config.json'

const baseUrl = config.pimexApi.url
const token = config.pimexApi.token

const pimex = {}

pimex.getLead = async leadId => {
  const { data } = await request.get(`${baseUrl}/conversions/${leadId}`)
  return data.data
}

pimex.addLead = async leadData => {
  const { data } = await request.post(`${baseUrl}/conversions/`, leadData)
  return data
}

pimex.addLeadTask = async (leadId, calendarInfo, selectedHour, eventData) => {
  const taskData = {
    title: `Reunión ${calendarInfo.title}`,
    category: 'meeting',
    description: `<strong style="font-weight: bold;">Descripción: </strong> ${
      calendarInfo.description
    } <br/> 
    <strong style="font-weight: bold;">Enlace: </strong> <a href="${
      eventData.hangoutLink
    }">${eventData.hangoutLink}</a> <br/> 
    <strong style="font-weight: bold;">Inicio de reunión: </strong> ${selectedHour.start.toLocaleString()} <br/> 
    <strong style="font-weight: bold;">Fin de reunión: </strong> ${selectedHour.end.toLocaleString()}`,
    start_date: selectedHour.start.getTime() / 1000,
    reminder: {
      exect_date: selectedHour.start.getTime() / 1000
    }
  }
  const { data } = await request.post(
    `${baseUrl}/conversions/${leadId}/tasks`,
    taskData,
    {
      headers: {
        Authorization: token
      }
    }
  )
  return data
}

export default pimex
