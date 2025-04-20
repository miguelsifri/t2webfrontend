// components/alert.js

export function createAlert(message, type = 'error') {
  const container = document.createElement('div');
  container.className = 'flex items-center justify-center h-screen';

  const colors = {
    error: {
      bg: 'bg-red-100',
      border: 'border-red-400',
      text: 'text-red-700',
      icon: 'text-red-600',
    },
    success: {
      bg: 'bg-green-100',
      border: 'border-green-400',
      text: 'text-green-700',
      icon: 'text-green-600',
    },
    warning: {
      bg: 'bg-yellow-100',
      border: 'border-yellow-400',
      text: 'text-yellow-700',
      icon: 'text-yellow-600',
    },
  };

  const { bg, border, text, icon } = colors[type] || colors.error;

  container.innerHTML = `
    <div class="${bg} ${border} ${text} px-6 py-4 rounded-lg shadow-md text-center max-w-md border">
      <div class="flex items-center justify-center gap-2 mb-2">
        <svg class="w-6 h-6 ${icon}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="font-semibold text-lg">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
      </div>
      ${message}
    </div>
  `;

  return container;
}
