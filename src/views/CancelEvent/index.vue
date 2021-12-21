<template>
  <div class="verify-container">
    <transition name="opacity" mode="out-in">
      <div v-if="loading && !error.state" class="loading-state" :key="0">
        <div class="loader" />
        <h1>Cancelando evento...</h1>
      </div>
      <div v-else-if="!loading && !error.state" class="success-state" :key="2">
        <h1>¡Se ha cancelado el evento!</h1>
        <h2>Muchas gracias por la respuesta, puedes cerrar esta ventana.</h2>
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
