import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://sgrwtdcibnobdxixzrfm.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNncnd0ZGNpYm5vYmR4aXh6cmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NTcyODAsImV4cCI6MjA1NjMzMzI4MH0.X7mZQYMhMqPtz9jTW9j-dlHY6EIbXamKnSr4RFQTcA0'
    );
  }

  get client() {
    return this.supabase;
  }
}
