<script>
  import {
    Item,
    Text,
    SecondaryText,
    PrimaryText,
    Graphic,
    Meta,
  } from "@smui/list";

  export let user;
</script>

<style lang="scss">
  @import "../../theme/colors";
</style>

<Item>
  <Graphic
    style="background-image: url(https://via.placeholder.com/40x40.png?text={user.first_name.substring(0, 1)}{user.last_name.substring(0, 1)});" />
  <Text>
    <PrimaryText>
      {user.first_name}
      {user.last_name}{#if user.role},
        {user.role.name}{/if}{#if user.class},
        {user.class.grade}{user.class.letter}{/if}{#if user.school},
        {user.school.name}
      {/if}
    </PrimaryText>
    <SecondaryText>Баллы: {user.prizeSum}</SecondaryText>
  </Text>
</Item>
