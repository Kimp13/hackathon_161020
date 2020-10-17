<script>
  import TransitionWrapper from "../components/TransitionWrapper.svelte";
  import Title from "../components/Title.svelte";
</script>

<Title caption="ЧаВо" />

<style lang="scss">
  @import "../theme/colors";

  .centered {
    color: $mdc-theme-secondary;
    text-align: center;
  }
</style>

<TransitionWrapper>
  <h2 class="centered">
    Тут ответы на частые вопросы.
  </h2>
</TransitionWrapper>