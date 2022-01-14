<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap");
* {
  font-family: "Roboto", sans-serif;
  margin: 0;
  padding: 0;
}

.loader {
  align-self: center;
  position: absolute;
  z-index: 100;
  width: 80px;
  height: 80px;
  border: 5px solid transparent;
  border-right: 5px solid #17cfcc;
  border-bottom: 5px solid #17cfcc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.calendar-error {
  display: flex;
  align-items: center;
  img {
    width: 50px;
    margin-right: 15px;
  }
  h2 {
    color: #2b2b2b;
  }
}

.vc-day {
  min-height: 50px !important;
  span {
    width: 35px !important;
    height: 35px !important;
    font-size: 18px !important;
    margin: 0 !important;
    align-self: center !important;
  }
  span:not(.is-disabled) {
    background-color: #17cfcc !important;
    color: white !important;
    transition: 0.2s ease-out, transform 0.2s ease-out;
    &:hover {
      background-color: #17cfcc99 !important;
      transform: scale(1.1);
    }
  }
}

.vc-header {
  padding: 20px !important;
}

.vc-arrows-container {
  margin-top: 10px;
}

.vc-arrow {
  border-radius: 50% !important;
}

.opacity-enter,
.opacity-leave-to {
  opacity: 0;
}

.opacity-enter-active,
.opacity-leave-active {
  transition: all 0.2s ease-out;
}

.opacity-enter-to,
.opacity-leave {
  opacity: 1;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
