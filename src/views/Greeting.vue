<template>
  <div class="hello">
    <h1>Welcome to Pimex Calendar</h1>
    <p>All work's fine :)</p>
  </div>
</template>

<script>
export default {
  name: "Greeting",
};
</script>

<style lang="scss" scoped>
.hello {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  h1,
  p {
    color: #999;
    font-weight: 300;
    text-align: center;
  }
}
</style>
