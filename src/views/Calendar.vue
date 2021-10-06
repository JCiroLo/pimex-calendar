<template>
  <div class="calendar">
    <div class="summary">
      <div class="header">
        <img
          class="logo"
          src="https://d3v0px0pttie1i.cloudfront.net/uploads/team/avatar/142538/aff4e7a2.png"
          alt=""
        />
        <span>
          <h1 class="title">{{ calendarInfo.title }}</h1>
          <h3 class="subtitle">{{ calendarInfo.subtitle }}</h3>
        </span>
      </div>
      <h3 class="duration">
        <i class="fas fa-clock fa-fw"></i> {{ calendarInfo.duration }}
      </h3>
      <p class="description">{{ calendarInfo.description }}</p>
    </div>
    <transition name="fade-tabs" mode="out-in">
      <div class="schedule-day" key="0" v-if="currentTab === 0">
        <span>
          <h2>Selecciona una fecha</h2>
        </span>
        <vc-calendar
          class="v-calendar"
          :attributes="avaiableDays"
          :disabled-dates="{ weekdays: [1, 2, 4, 6, 7] }"
          :min-date="new Date()"
          @dayclick="selectDay"
          is-expanded
        />
      </div>
      <div class="schedule-hour" key="1" v-if="currentTab === 1">
        <span>
          <button @click="goBack">
            <i class="fas fa-fw fa-chevron-left"></i>
          </button>
          <h2>Selecciona una hora</h2>
        </span>
        <h3>{{ selectedDay.ariaLabel }}</h3>
        <div class="hours-group">
          <button
            v-for="(hour, index) in avaiableHours"
            :key="index"
            :class="{ disabled: hour.isDisabled }"
            @click="selectHour(hour)"
          >
            {{ hour.label }}
          </button>
        </div>
      </div>
      <div class="form" key="2" v-else-if="currentTab === 2">
        <span>
          <button @click="goBack">
            <i class="fas fa-fw fa-chevron-left"></i>
          </button>
          <h2>Completa el formulario</h2>
        </span>
        <h3>{{ selectedDay.ariaLabel }} a las {{ selectedHour.label }}</h3>
        <form class="form-group" @submit.prevent="handleForm">
          <div
            class="input-field"
            v-for="(field, index) in formFields"
            :key="index"
          >
            <label>{{ field.label }}{{ field.required ? "*" : "" }}</label>
            <input
              v-model="field.value"
              :type="field.type"
              :required="field.required"
            />
          </div>
          <button type="submit">Enviar</button>
        </form>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "Calendar",
  data() {
    return {
      calendarInfo: {
        title: "Asesoría Médica",
        subtitle: "Consulta Médica para personas infelices",
        duration: "30 mins",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean non finibus eros, quis scelerisque purus. Nullam non velit dignissim velit interdum placerat non vitae risus. Nam id justo et tellus ultricies maximus. Morbi pharetra massa non dictum porta. Nullam sed nisl lorem. Morbi et vulputate elit, vitae laoreet arcu. In malesuada lorem in ornare maximus. Quisque id hendrerit lorem. Cras dignissim, nisl sit amet dignissim tempus, enim tellus venenatis neque, nec laoreet justo odio ut diam.",
      },
      currentTab: 0,
      avaiableDays: [],
      selectedDay: {},
      avaiableHours: [],
      selectedHour: {},
      formFields: [],
    };
  },
  methods: {
    selectDay(day) {
      if (day.isDisabled) {
        return;
      }
      this.selectedDay = day;
      this.currentTab = 1;
    },
    selectHour(hour) {
      if (hour.isDisabled) {
        return;
      }
      this.selectedHour = hour;
      this.currentTab = 2;
    },
    handleForm() {
      console.log(this.formFields);
    },
    goBack() {
      this.currentTab--;
    },
  },
  beforeMount() {
    const highlight = {
      style: {
        backgroundColor: "#17cfcc",
        padding: "20px",
      },
      contentStyle: {
        color: "#fff",
        padding: "20px",
      },
    };
    this.avaiableDays = [
      {
        id: "2021-09-21",
        dates: "Tue Sep 21 2021 00:00:00 GMT-0500 (hora estándar de Colombia)",
        highlight,
      },
      {
        id: "2021-09-23",
        dates: "Thu Sep 23 2021 00:00:00 GMT-0500 (hora estándar de Colombia)",
        highlight,
      },
      {
        id: "2021-09-28",
        dates: "Tue Sep 28 2021 00:00:00 GMT-0500 (hora estándar de Colombia)",
        highlight,
      },
      {
        id: "2021-09-30",
        dates: "Thu Sep 30 2021 00:00:00 GMT-0500 (hora estándar de Colombia)",
        highlight,
      },
    ];
    this.avaiableHours = [
      { label: "12:00", isDisabled: false },
      { label: "12:30", isDisabled: true },
      { label: "13:00", isDisabled: false },
      { label: "13:30", isDisabled: false },
      { label: "14:00", isDisabled: false },
      { label: "14:00", isDisabled: true },
      { label: "14:30", isDisabled: false },
    ];
    this.formFields = [
      {
        type: "text",
        label: "Nombre completo",
        required: true,
        value: "",
      },
      {
        type: "tel",
        label: "Teléfono",
        required: false,
        value: "",
      },
      {
        type: "email",
        label: "Correo",
        required: true,
        value: "",
      },
      {
        type: "checkbox",
        label:
          "Autorizo a Pimex para el tratamiento de mis datos personales que se manejarán con la confidencialidad requerida",
        required: true,
        value: "",
      },
    ];
  },
};
</script>

<style scoped lang="scss">
.calendar {
  max-width: 1000px;
  margin: 30px auto;
  display: flex;
  border: 1px solid #dadce0;
  border-radius: 10px;
  color: #5f6368;
  .summary {
    flex-basis: 40%;
    padding: 25px 20px;
    border-right: 1px solid #dadce0;
    transition: flex-basis 0.2s ease-out;
    .header {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      .logo {
        margin-right: 20px;
        border-radius: 50%;
        width: 60px;
        height: 60px;
      }
      span {
        .title {
          margin: 0;
        }
        .subtitle {
          color: #c0c0c0;
        }
      }
    }
    .duration {
      margin: 20px 10px;
    }
    .description {
      margin-top: 10px;
    }
  }
  .schedule-day,
  .schedule-hour,
  .form {
    padding: 25px 20px;
    flex-basis: 60%;
    span {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      h2 {
        font-size: 22px;
      }
      button {
        margin-right: 10px;
        padding: 5px;
        background: transparent;
        color: #5f6368;
        border-radius: 50%;
        border: none;
        outline: none;
        cursor: pointer;
        font-size: 24px;
        font-weight: 700;
        transition: background-color 0.2s ease-out;

        &:hover {
          background-color: #5f636822;
        }
      }
    }
    h3 {
      margin: 20px 0 20px 5px;
      text-transform: capitalize;
      font-weight: 200;
      color: #c0c0c0;
    }
  }
  .schedule-day {
    .v-calendar {
      border: none;
    }
  }
  .schedule-hour {
    .hours-group {
      display: flex;
      flex-direction: column;
      button {
        padding: 10px 15px;
        margin: 5px 10px;
        font-size: 18px;
        font-weight: 700;
        border: none;
        outline: none;
        border-radius: 5px;
        color: white;
        background-color: #17cfcc;
        transition: background-color 0.2s ease-out, color 0.2s ease-out;

        &:hover {
          background-color: #17cfcc99;
          cursor: pointer;
          color: white;
        }

        &.disabled {
          color: #5f6368;
          background-color: #dadce088;

          &:hover {
            cursor: not-allowed;
          }
        }
      }
    }
  }
  .form {
    .form-group {
      display: flex;
      flex-direction: column;
      .input-field {
        display: flex;
        flex-direction: column;
        margin: 8px 10px;
        label {
          margin-bottom: 5px;
        }
        input {
          padding: 10px 12px;
          border-radius: 5px;
          outline: none;
          border: 1px solid #c0c0c0;
          background-color: transparent;
        }
      }
      button {
        padding: 10px 15px;
        margin: 5px 10px;
        font-size: 18px;
        font-weight: bold;
        border: 2px solid #17cfcc;
        outline: none;
        border-radius: 5px;
        cursor: pointer;
        color: #17cfcc;
        background-color: transparent;
        transition: background-color 0.2s ease-out, color 0.2s ease-out;

        &:hover {
          background-color: #17cfcc;
          color: white;
        }
      }
    }
  }
}

.fade-tabs-enter,
.fade-tabs-leave-to {
  opacity: 0;
}

.fade-tabs-enter-active,
.fade-tabs-leave-active {
  transition: all 0.2s ease-out;
}

.fade-tabs-enter-to,
.fade-tabs-leave {
  opacity: 1;
}
</style>
