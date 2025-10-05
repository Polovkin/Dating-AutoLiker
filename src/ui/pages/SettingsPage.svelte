<script lang="ts">
  // Mocked settings - will be implemented later
  let settings = {
    swipeDelay: { min: 1000, max: 3000 },
    autoLike: true,
    notifications: true,
    language: 'uk'
  };

  const languages = [
    { value: 'uk', label: 'Українська' },
    { value: 'en', label: 'English' },
    { value: 'ru', label: 'Русский' }
  ];

  function handleSave() {
    // Mock save functionality
    console.log('Settings saved:', settings);
    alert('Налаштування збережено!');
  }

  function handleReset() {
    // Mock reset functionality
    settings = {
      swipeDelay: { min: 1000, max: 3000 },
      autoLike: true,
      notifications: true,
      language: 'uk'
    };
    alert('Налаштування скинуто до стандартних!');
  }
</script>

<div class="p-4 h-full overflow-y-auto">
  <h2 class="text-lg font-semibold text-gray-800 mb-4">Налаштування</h2>

  <div class="space-y-6">
    <!-- Swipe Delay Settings -->
    <div class="bg-white border border-gray-200 rounded-lg p-4">
      <h3 class="text-sm font-medium text-gray-800 mb-3">Затримка між свайпами</h3>
      
      <div class="space-y-3">
        <div>
          <label for="min-delay" class="block text-xs text-gray-600 mb-1">Мінімальна затримка (мс)</label>
          <input
            id="min-delay"
            type="number"
            bind:value={settings.swipeDelay.min}
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="500"
            max="5000"
          />
        </div>
        
        <div>
          <label for="max-delay" class="block text-xs text-gray-600 mb-1">Максимальна затримка (мс)</label>
          <input
            id="max-delay"
            type="number"
            bind:value={settings.swipeDelay.max}
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1000"
            max="10000"
          />
        </div>
      </div>
    </div>

    <!-- Auto Like Settings -->
    <div class="bg-white border border-gray-200 rounded-lg p-4">
      <h3 class="text-sm font-medium text-gray-800 mb-3">Автоматичні дії</h3>
      
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-gray-700">Автоматичний лайк</div>
          <div class="text-xs text-gray-500">Завжди лайкати профілі</div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            bind:checked={settings.autoLike}
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>

    <!-- Notifications Settings -->
    <div class="bg-white border border-gray-200 rounded-lg p-4">
      <h3 class="text-sm font-medium text-gray-800 mb-3">Сповіщення</h3>
      
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-gray-700">Увімкнені сповіщення</div>
          <div class="text-xs text-gray-500">Показувати сповіщення про статус</div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            bind:checked={settings.notifications}
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>

    <!-- Language Settings -->
    <div class="bg-white border border-gray-200 rounded-lg p-4">
      <h3 class="text-sm font-medium text-gray-800 mb-3">Мова інтерфейсу</h3>
      
      <select
        bind:value={settings.language}
        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {#each languages as lang}
          <option value={lang.value}>{lang.label}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="mt-6 flex space-x-3">
    <button
      class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
      on:click={handleSave}
    >
      Зберегти
    </button>
    <button
      class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
      on:click={handleReset}
    >
      Скинути
    </button>
  </div>

  <!-- Development Note -->
  <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
    <div class="flex items-center">
      <span class="text-yellow-600 mr-2">⚠️</span>
      <span class="text-xs text-yellow-700">
        Налаштування поки що не зберігаються. Функціональність буде додана пізніше.
      </span>
    </div>
  </div>
</div>
