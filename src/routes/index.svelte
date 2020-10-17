<script>
  import { stores } from "@sapper/app";
  import TransitionWrapper from "../components/TransitionWrapper.svelte";
  import Title from "../components/Title.svelte";

  const { session } = stores();

  $: console.log($session.user);
</script>

<style lang="sass">
  @import "../theme/colors"

  h1,
  h2
    color: $mdc-theme-secondary
    text-align: center
</style>

<Title caption="Главная" />

<TransitionWrapper>
  <h1>Привет, {
    $session.user.isAuthenticated ?
      `${$session.user.first_name} ${$session.user.last_name}` :
      "неизвестный пользователь"
  }!</h1>
  {#if $session.user.approved === null}
    <h2>Заявку на подтверждение ещё не рассмотрели.</h2>
  {:else if $session.user.approved === 0}
    <h1>Ты ЗАБАНЕН!</h1>
  {/if}
</TransitionWrapper>
