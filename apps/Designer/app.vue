<template>
  <UApp>

    <UHeader>
      <template #left>
        <nav>
          <ul>
            <li>
              <NuxtLink to="/">About</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/devices">Post 1</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/servers">Post 2</NuxtLink>
            </li>
          </ul>
        </nav>
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

  </UApp>
</template>
