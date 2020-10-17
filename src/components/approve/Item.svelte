<script>
  import { createEventDispatcher } from "svelte";

  import {
    Item,
    Text,
    SecondaryText,
    PrimaryText,
    Graphic,
    Meta,
  } from "@smui/list";
  import Button from "../Button.svelte";

  export let user;
  export let approved;

  console.log(approved);

  const dispatch = createEventDispatcher();
</script>

<style lang="scss">
  @import "../../theme/colors";

  div.material-icons {
    width: 100%;
    height: 2rem;
    background: $mdc-theme-primary;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;

    &.disapproved {
      background: $mdc-theme-secondary;
    }
  }
</style>

<Item>
  {#if approved === true}
    <div class="material-icons">
      check
    </div>
  {:else if approved === false}
    <div class="material-icons disapproved">
      close
    </div>
  {:else}
    <Graphic
      style="background-image: url(https://via.placeholder.com/40x40.png?text={user.first_name.substring(0, 1)}{user.last_name.substring(0, 1)});" />
    <Text>
      <PrimaryText>Подтвердждение пользователя</PrimaryText>
      <SecondaryText>
        {user.first_name}
        {user.last_name},
        {user.role.name}
        {user.class.grade}{user.class.letter},
        {user.school.name}
      </SecondaryText>
    </Text>
    <Meta>
      <Button icon="check" on:click={() => dispatch('approve')} />
      <Button
        icon="close"
        color="secondary"
        on:click={() => dispatch('disapprove')} />
    </Meta>
  {/if}
</Item>
