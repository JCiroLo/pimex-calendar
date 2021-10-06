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

.vc-day {
  min-height: 50px !important;
}

.vc-header {
  padding: 20px !important;
}

.vc-arrows-container {
  margin-top: 10px;
}

.vc-arrow{
  border-radius: 50% !important;
}
</style>
