import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <div class="bg-white rounded shadow p-4">
      <h2 class="text-2xl font-bold mb-2">Admin</h2>
      <p class="text-gray-600">Área protegida por ROLE_ADMIN.</p>
    </div>
  `,
})
export class AdminPage {}
