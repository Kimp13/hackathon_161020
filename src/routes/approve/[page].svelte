<script context="module">
  import { getPreloadApiResponse } from "../../../utils/requests";

  import List from "@smui/list";
  import Item from "../../components/approve/Item.svelte";

  export async function preload(page, session) {
    const people = await getPreloadApiResponse(
      `${session.apiUrl}/users/getApprovable`,
      {
        page: page.params.page,
      },
      this
    );

    return {
      people,
    };
  }
</script>

<script>
  import { stores } from "@sapper/app";

  import { postApi } from "../../../utils/requests";

  import LinearProgress from "@smui/linear-progress";

  export let people;

  const peoplePromises = {};
  const { session } = stores();

  const handleAction = (index, approve = true) => {
    peoplePromises[index] = postApi(
      `${$session.apiUrl}/users/approve`,
      {
        approve,
        userId: people[index].id,
      },
      true
    );

    peoplePromises[index].then((response) => {
      response.approved = approve;
    });
  };
</script>

<style lang="scss">
  @import "../../theme/colors";

  .error {
    color: $mdc-theme-error;
    text-align: center;
    font-size: 0.8rem;
  }
</style>

<List twoLine avatarList>
  {#each people as user, index (user.id)}
    {#if peoplePromises[index]}
      {#await peoplePromises[index]}
        <Item {user} />

        <LinearProgress indeterminate />
      {:then response}
        <Item {user} approved={response.approved} />
      {:catch e}
        <p class="error">
          Произошла неизведанная миру ошибка. Пожалуйста, обратитесь к
          администратору.
        </p>
      {/await}
    {:else}
      <Item
        {user}
        on:approve={() => handleAction(index)}
        on:disapprove={() => handleAction(index, false)} />
    {/if}
  {/each}
</List>
