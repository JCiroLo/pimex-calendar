<template>
  <div class="container">
    <transition name="opacity" mode="out-in">
      <div v-if="loading.calendar && !error.state" class="loader" :key="0" />
      <div
        v-else-if="!loading.calendar && !error.state"
        class="calendar"
        :key="1"
      >
        <div class="summary">
          <div class="header">
            <img
              class="logo"
              :src="calendarInfo.image.url"
              :alt="`${calendarInfo.title}_logo`"
            />
            <span>
              <h1 class="title">{{ calendarInfo.title }}</h1>
              <h3 class="subtitle">{{ calendarInfo.subtitle }}</h3>
            </span>
          </div>
          <h3 class="duration">
            <i class="fas fa-clock fa-fw"></i>
            {{ calendarInfo.duration | formatDuration }}
          </h3>
          <nl2br
            tag="p"
            :text="calendarInfo.description"
            class-name="description"
          />
        </div>
        <transition name="opacity" mode="out-in">
          <div class="schedule-day" key="0" v-if="currentTab === 0">
            <div v-if="loading.hours" class="loader" />
            <span>
              <button disabled>
                <i class="fas fa-fw fa-chevron-left"></i>
              </button>
              <h2>Selecciona una fecha</h2>
              <div class="spacer"></div>
            </span>
            <vc-calendar
              class="v-calendar"
              :class="{ loading: loading.hours }"
              :min-date="getAvaiableDates().from"
              :max-date="getAvaiableDates().to"
              :disabled-dates="{ weekdays: disabledDates }"
              @dayclick="selectDay"
              is-expanded
            />
          </div>
          <div class="schedule-hour" key="1" v-else-if="currentTab === 1">
            <span>
              <button @click="goBack">
                <i class="fas fa-fw fa-chevron-left"></i>
              </button>
              <h2>Selecciona una hora</h2>
            </span>
            <h3>{{ selectedDay.ariaLabel }}</h3>
            <div class="hours-group">
              <button
                v-for="(hour, index) in sortedAvaiableHours"
                :key="index"
                @click="selectHour(hour)"
              >
                {{ hour.start | formatHour }}
              </button>
            </div>
          </div>
          <div class="form" key="2" v-else-if="currentTab === 2">
            <div v-if="loading.creatingEvent" class="loader" />
            <span>
              <button @click="goBack">
                <i class="fas fa-fw fa-chevron-left"></i>
              </button>
              <h2>Completa el formulario de contacto</h2>
            </span>
            <h3>
              {{ selectedDay.ariaLabel }} a las
              {{ selectedHour.start | formatHour }}
            </h3>
            <form
              class="form-group"
              :class="{ disabled: loading.creatingEvent }"
              @submit.prevent="handleForm"
            >
              <div class="input-field">
                <label>
                  {{ calendarInfo.formFields.required.label }}
                  <strong style="color: red;">
                    {{ calendarInfo.formFields.required.required ? "*" : "" }}
                  </strong>
                </label>
                <input
                  v-model="calendarInfo.formFields.required.value"
                  :type="calendarInfo.formFields.required.type"
                  :required="calendarInfo.formFields.required.required"
                />
              </div>
              <div
                class="input-field"
                v-for="(field, index) in calendarInfo.formFields.custom"
                :key="index"
              >
                <label>
                  {{ field.label }}
                  <strong style="color: red;">
                    {{ field.required ? "*" : "" }}
                  </strong>
                </label>
                <input
                  v-model="field.value"
                  :type="field.type"
                  :required="field.required"
                />
              </div>
              <button type="submit">Enviar</button>
            </form>
          </div>
          <div class="success" key="3" v-else>
            <div class="mail-sended">
              <img
                src="https://res.cloudinary.com/practicaldev/image/fetch/s--1II67h1R--/c_imagga_scale,f_auto,fl_progressive,h_420,q_auto,w_1000/https://faruknasir.com/images/blog/2021/verification_url.png"
                alt=""
              />
              <h2>Felicitaciones, se ha agendado la cita.</h2>
              <p>
                Enviamos un correo electrónico a
                <span>{{ meetData.attendees[0].email }}</span> para confirmar la
                asistencia, por favor verifique.
              </p>
            </div>

            <div class="meet-summary">
              <div class="icon">
                <img :src="meetIcon" alt="meet_icon" />
                <p>{{ meetData.summary }}</p>
              </div>
              <div class="icon">
                <i class="far fa-clock fa-fw"></i>
                <p>
                  {{ selectedDay.ariaLabel }}
                </p>
              </div>
              <div class="icon">
                <i class="far fa-clock fa-fw"></i>
                <p>
                  {{ selectedHour.start | formatHour }} -
                  {{ selectedHour.end | formatHour }}
                </p>
              </div>
              <div class="icon">
                <i class="far fa-link fa-fw"></i>
                <p>
                  <a :href="meetData.hangoutLink">{{ meetData.hangoutLink }}</a>
                </p>
              </div>
            </div>
          </div>
        </transition>
      </div>
      <div v-else-if="error.state" class="calendar-error" :key="2">
        <img
          src="https://www.pngall.com/wp-content/uploads/8/Warning-PNG-Free-Image.png"
          alt=""
        />
        <h2>{{ error.message }}</h2>
      </div>
    </transition>
  </div>
</template>
<script src="./index.js"></script>
<style lang="scss" src="./styles.scss"></style>
