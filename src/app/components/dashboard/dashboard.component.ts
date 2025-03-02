import { Component, ViewChild } from '@angular/core'; 
// 'Component' is voor het maken van Angular componenten
// 'ViewChild' is voor het verkrijgen van een referentie naar een DOM-element of child component
import { FormsModule } from '@angular/forms'; // FormsModule is voor het gebruik van formulieren in Angular, zoals ngModel voor two-way binding
import { CommonModule } from '@angular/common'; // CommonModule bevat algemene Angular functionaliteit, zoals ngIf, ngFor, etc., die nodig is in standalone componenten
import { NgChartsModule } from 'ng2-charts'; // NgChartsModule is voor het integreren van grafieken in je Angular app, een wrapper voor Chart.js
import { BaseChartDirective } from 'ng2-charts'; // BaseChartDirective wordt gebruikt om grafieken weer te geven en is nodig voor @ViewChild referentie naar het chart element
import { ChartData, ChartOptions } from 'chart.js'; // 'ChartData' en 'ChartOptions' zijn de types voor het configureren en opmaken van de grafiekgegevens en opties in Chart.js
import { SupabaseService } from '../../supabase.service'; // SupabaseService biedt een service om te communiceren met de Supabase backend (bijvoorbeeld voor het ophalen van transacties)
import { TransactionService, Transaction } from '../../transaction.service'; 
// TransactionService bevat methodes voor het beheren van transacties, zoals toevoegen, bewerken en verwijderen
// 'Transaction' is het type voor de transactieobjecten die in de app worden gebruikt

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective; // Reference the chart directive

  editingIndex: number | null = null;
  balance: number = 0;
  income: number = 0;
  expenses: number = 0;
  transactionType: string = 'income'; // New field for transaction type
  description: string = '';
  amount: number = 0; 

  transactions: { id: number, type: string, description: string, amount: number }[] = [];

  constructor(private supabaseService: SupabaseService, private transactionService: TransactionService) {}

  // Grafiekdata
  chartData: ChartData<'bar'> = {
    labels: ['Income', 'Expense'],
    datasets: [
      {
        data: [0, 0], // Income vs Expense data
        backgroundColor: ['#4CAF50', '#F44336'],
        label: 'Transactions'
      }
    ]
  }

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  }

  async ngOnInit() {
    await this.loadTransactions();
    this.updateChartData();
    this.updateBalance();
  }

  async loadTransactions() {  
    const { data, error } = await this.supabaseService.client
      .from("transactions")
      .select("id, type, description, amount")
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error("Error fetching transactions:", error);
    } else {
      this.transactions = data || [];
      console.log("Transactions loaded:", this.transactions);
    }
  }  

  private calculateTotalByType(type: string): number {
    return this.transactions
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  updateChartData() {
    const totalIncome = this.calculateTotalByType('income');
    const totalExpenses = this.calculateTotalByType('expense');
    this.chartData.datasets[0].data = [totalIncome, totalExpenses]; // Update data in chart
    if (this.chart?.chart) {
      this.chart.chart.update(); // Force chart update if chart object exists
    }
  }

  updateBalance() {
    this.income = this.calculateTotalByType('income');
    this.expenses = this.calculateTotalByType('expense');
    this.balance = this.income - this.expenses;
  }

  clearForm() {
    this.description = '';
    this.amount = 0;
    this.transactionType = 'income';
    this.editingIndex = null;
  }

  async addTransaction() {
    const { data, error } = await this.supabaseService.client
      .from('transactions')
      .insert([
        { type: this.transactionType, description: this.description, amount: this.amount }
      ])
      .select(); //Zorgt ervoor dat Supabase de nieuwe transactie terugstuurt met het gegenereerde ID
  
    if (error) {
      console.error('Error adding transaction:', error);
      return;
    }
  
    if (data && data.length > 0) {
      const newTransaction = data[0]; //Dit bevat de nieuwe transactie inclusief ID
  
      this.transactions.push({
        id: newTransaction.id, //Voeg het ID toe aan de array
        type: newTransaction.type,
        description: newTransaction.description,
        amount: newTransaction.amount
      });
  
      this.updateBalance();
      this.updateChartData();
      this.clearForm();
    }
  }

  editTransaction(id: number) {
    const transaction = this.transactions.find(t => t.id === id);
    if (transaction) {
      this.description = transaction.description;
      this.amount = transaction.amount;
      this.transactionType = transaction.type;
      this.editingIndex = id; //Bijhouden van het ID van de bewerkte transactie
    }
  }

  async updateTransaction(id: number, updatedData: Partial<Transaction>) {
    await this.transactionService.updateTransaction(id, updatedData);
  
    const index = this.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      this.transactions[index] = { 
        ...this.transactions[index], //Behoud bestaande waarden
        ...updatedData               //Overschrijf met nieuwe waarden
      };
    }
  
    this.updateBalance();
    this.updateChartData();
    this.clearForm();
  }
  
  async deleteTransaction(id: number) {
    // Verwijder de transactie uit de database
    await this.transactionService.deleteTransaction(id);
    
    this.transactions = this.transactions.filter(t => t.id !== id);

    // Werk het saldo bij na het verwijderen
    this.loadTransactions();
    this.updateBalance();
    this.updateChartData(); // Update chart data
    this.clearForm();
  }  
}