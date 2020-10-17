<script context="module">
  import { getPreloadApiResponse } from "../../../utils/requests";

  export async function preload(page, session) {
    let sortWay, i;
    const sortWays = [
      ["Имя", "first_name"],
      ["Фамилия", "last_name"],
      ["По умолчанию", "id"],
    ];

    for (i = 0; i < sortWays.length; i += 1) {
      if (page.query.sort_by == sortWays[i][1]) {
        sortWay = sortWays[i][1];
        break;
      }
    }

    if (i === sortWays.length) {
      sortWay = sortWays[0][1];
    }

    console.log(sortWay);

    const people = await getPreloadApiResponse(
      `${session.apiUrl}/users/getManageable`,
      {
        page: page.params.page,
        sort_by: sortWay,
      },
      this
    );

    return {
      people,
    };
  }
</script>

<script>
  import List from "@smui/list";
  import Item from "../../components/manage/Item.svelte";

  export let people;
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
    <Item {user} />
  {/each}
</List>
