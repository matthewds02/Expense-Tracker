import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})

export class TransactionService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://sgrwtdcibnobdxixzrfm.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNncnd0ZGNpYm5vYmR4aXh6cmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NTcyODAsImV4cCI6MjA1NjMzMzI4MH0.X7mZQYMhMqPtz9jTW9j-dlHY6EIbXamKnSr4RFQTcA0'
    );
  }

  async deleteTransaction(id: number) {
    const { error } = await this.supabase
      .from('transactions')
      .delete()
      .match({ id });

    if (error) {
      console.error('Error deleting transaction:', error.message);
    } else {
      console.log('Transaction deleted successfully');
    }
  }

  async updateTransaction(id: number, updatedData: Partial<Transaction>) {
    const { error } = await this.supabase
      .from('transactions')
      .update({
        description: updatedData.description,
        amount: updatedData.amount,
        type: updatedData.type,
         category_id: updatedData.category?.id, 
         subcategory_id: updatedData.subcategory?.id})
      .match({ id });
    if (error) {
      console.error('Error updating transaction:', error.message);
    } else {
      console.log('Transaction updated successfully');
    }
  }
}

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  type: string;
  category: Category | null;
  subcategory: Category | null;
}

export interface Category {
  id: number;
  name: string;
}