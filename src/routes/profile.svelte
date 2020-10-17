<script>
  import { goto } from "@sapper/app";

  import TransitionWrapper from "../components/TransitionWrapper.svelte";
  import Title from "../components/Title.svelte";
  import Button from "../components/Button.svelte";
</script>

<Title caption="Профиль" />

<style lang="sass">
  .centered
    margin: 1rem
    display: flex
    justify-content: center
</style>

<TransitionWrapper>
  <div class="centered">
    <Button label="Выйти" on:click={() => goto('/logout')} />
  </div>
</TransitionWrapper>
