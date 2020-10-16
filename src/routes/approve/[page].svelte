<script context="module">
  import { getPreloadApiResponse } from "../../../utils/requests";

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
  export let people;
</script>

{#each people as user}
  <h2>{user.username}</h2>
{/each}
