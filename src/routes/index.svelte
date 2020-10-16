<script>
  import { stores } from "@sapper/app";
  import TransitionWrapper from "../components/TransitionWrapper.svelte";
  import Title from "../components/Title.svelte";

  const { session } = stores();
</script>

<style lang="sass">
  @import "../theme/colors"

  h1
    color: $mdc-theme-secondary
    text-align: center
</style>

<Title caption="Главная" />

<TransitionWrapper>
  <h1>Привет, {$session.user.username || "неизвестный пользователь"}!</h1>
</TransitionWrapper>
