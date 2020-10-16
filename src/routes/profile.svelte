<script>
  import { goto } from "@sapper/app";

  import TransitionWrapper from "../components/TransitionWrapper.svelte";
  import Title from "../components/Title.svelte";
  import Button from "../components/Button.svelte";
</script>

<Title caption="Профиль" />

<TransitionWrapper>
  <h1>profile</h1>
  <Button label="Выйти" on:click={() => goto('/logout')} />
</TransitionWrapper>
