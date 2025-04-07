import { Component, ViewChild } from '@angular/core'; 
// 'Component' is voor het maken van Angular componenten
// 'ViewChild' is voor het verkrijgen van een referentie naar een DOM-element of child component
import { FormsModule } from '@angular/forms'; // FormsModule is voor het gebruik van formulieren in Angular, zoals ngModel voor two-way binding
import { CommonModule } from '@angular/common'; // CommonModule bevat algemene Angular functionaliteit, zoals ngIf, ngFor, etc., die nodig is in standalone componenten
import { NgChartsModule } from 'ng2-charts'; // NgChartsModule is voor het integreren van grafieken in je Angular app, een wrapper voor Chart.js
import { BaseChartDirective } from 'ng2-charts'; // BaseChartDirective wordt gebruikt om grafieken weer te geven en is nodig voor @ViewChild referentie naar het chart element
import { ChartData, ChartOptions } from 'chart.js'; // 'ChartData' en 'ChartOptions' zijn de types voor het configureren en opmaken van de grafiekgegevens en opties in Chart.js
import { SupabaseService } from '../../supabase.service'; // SupabaseService biedt een service om te communiceren met de Supabase backend (bijvoorbeeld voor het ophalen van transacties)
import { TransactionService, Transaction, Category } from '../../transaction.service'; 
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
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  editingIndex: number | null = null;
  balance: number = 0;
  income: number = 0;
  expenses: number = 0;
  transactionType: string = 'income';
  description: string = '';
  amount: number = 0; 
  date_activity_happened: Date = new Date();
  date_payment_happened: Date = new Date();
  selectedCategory: number | null = null;
  selectedSubcategory: number | null = null;

  transactions: Transaction[] = [];
  categories: Category[] = [];
  subcategories: Category[] = [];
  

  constructor(private supabaseService: SupabaseService, private transactionService: TransactionService) {}

  get dateActivityString(): string {
    if (!this.date_activity_happened) return '';
    const date = this.date_activity_happened instanceof Date
      ? this.date_activity_happened
      : new Date(this.date_activity_happened);
    return date.toISOString().split('T')[0];    
  }

  set dateActivityString(value: string) {
    this.date_activity_happened = new Date(value);
  }

  get datePaymentString(): string {
    if (!this.date_payment_happened) return '';
    const date = this.date_payment_happened instanceof Date
      ? this.date_payment_happened
      : new Date(this.date_payment_happened);
    return date.toISOString().split('T')[0];
  }

  set datePaymentString(value: string) {
    this.date_payment_happened = new Date(value);
  }

  formatDate(date: string | Date | null | undefined): string {
    if (!date) return '';
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0'); // maand is 0-based
    const year = parsedDate.getFullYear();

    return `${day}-${month}-${year}`;
  }

  trackById(index: number, item: Transaction) {
  return item.id;
  }

  chartData: ChartData<'bar'> = {
    labels: ['Income', 'Expense'],
    datasets: [
      {
        data: [0, 0],
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
    if (this.selectedCategory) {
      await this.loadSubcategories(this.selectedCategory);
    }
    this.updateChartData();
    this.updateBalance();
  }

  async loadTransactions() {
    // Haal alle categorieën en subcategorieën op
    const { categoriesMap, subcategoriesMap } = await this.loadCategoriesAndSubcategories();
  
    const { data, error } = await this.supabaseService.client
      .from("transactions")
      .select("id, type, description, amount, date_activity_happened, date_payment_happened, category_id, subcategory_id")
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error("Error fetching transactions:", error);
    } else {
      console.log("Raw Supabase data:", data);
  
      // Koppel categorieën en subcategorieën aan transacties
      this.transactions = data?.map(transaction => ({
        id: transaction.id,
        type: transaction.type,
        description: transaction.description,
        amount: transaction.amount,
        date_activity_happened: new Date(transaction.date_activity_happened),
        date_payment_happened: new Date(transaction.date_payment_happened),
        category: categoriesMap.get(transaction.category_id) || null,
        subcategory: subcategoriesMap.get(transaction.subcategory_id) || null
      })) || [];
  
      console.log("Transactions loaded:", this.transactions);
      console.log("categorien:", this.categories);
      console.log("subcategories:", this.subcategories);
    }
  }

  async loadCategoriesAndSubcategories() {
    const { data: categories, error: categoriesError } = await this.supabaseService.client
      .from("categories")
      .select("id, name, parent_id");
  
    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
      return { categoriesMap: new Map<number, { id: number; name: string }>(), subcategoriesMap: new Map<number, { id: number; name: string }>() };
    }
  
    //ToDo dubbele code voor zelfde logica in loadTransactions
    this.categories = categories?.filter(category => category.parent_id === null) || [];
    this.subcategories = categories?.filter(category => category.parent_id !== null) || [];

    // Maak mappen voor snelle toegang
    const categoriesMap = new Map<number, { id: number; name: string }>();
    const subcategoriesMap = new Map<number, { id: number; name: string }>();
  
    categories?.forEach(category => {
      if (category.parent_id === null) {
        // Hoofdcategorie
        categoriesMap.set(category.id, { id: category.id, name: category.name });
      } else {
        // Subcategorie
        subcategoriesMap.set(category.id, { id: category.id, name: category.name });
      }
    });

    return { categoriesMap, subcategoriesMap };
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
      this.chart.chart.update(); // Forceert chart update als het chart chart object bestaat
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
    this.selectedCategory = null;
    this.selectedSubcategory = null;
    this.date_activity_happened = new Date();
    this.date_payment_happened = new Date();
    this.editingIndex = null;
  }

  async addTransaction() {
    // Validatie van de velden
    //ToDo: Verplaats naar een aparte functie + 'foutmeldingscomponent toe te voegen die de foutberichten op een gebruiksvriendelijke manier toont in de UI. Dit maakt de app gebruiksvriendelijker, vooral als er meerdere validatiefouten optreden.'

    if (!this.description.trim()) {
      alert('Beschrijving is verplicht');
      return;
    }
    if (this.amount <= 0) {
      alert('Bedrag moet groter dan 0 zijn');
      return;
    }
    if (this.selectedCategory === null) {
      alert('Categorie is verplicht');
      return;
    }
    if (this.selectedSubcategory === null) {
      alert('Subcategorie is verplicht');
      return;
    }

    const { data, error } = await this.supabaseService.client
      .from('transactions')
      .insert([
        { type: this.transactionType, description: this.description, amount: this.amount, category_id: this.selectedCategory, subcategory_id: this.selectedSubcategory, date_activity_happened: this.date_activity_happened.toISOString(), date_payment_happened: this.date_payment_happened.toISOString()}
      ])
      .select(); //Zorgt ervoor dat Supabase de nieuwe transactie terugstuurt met het gegenereerde ID

    if (error) {
      console.error('Error adding transaction:', error);
      return;
    }

    if (data && data.length > 0) {
      const newTransaction = data[0]; //Dit bevat de nieuwe transactie inclusief ID

      this.transactions.unshift({ // unshift = Voegt aan het begin van de array tegenover push die aan het einde toevoegt
        id: newTransaction.id,
        type: newTransaction.type,
        description: newTransaction.description,
        amount: newTransaction.amount,
        date_activity_happened: newTransaction.date_activity_happened,
        date_payment_happened: newTransaction.date_payment_happened,
        category: this.categories.find(cat => cat.id === newTransaction.category_id) || null,
        subcategory: this.subcategories.find(subcat => subcat.id === newTransaction.subcategory_id) || null
      });

      this.updateBalance();
      this.updateChartData();
      this.clearForm();
    }
  }

  async editTransaction(id: number) {
    const transaction = this.transactions.find(t => t.id === id);
    if (transaction) {
      this.description = transaction.description;
      this.amount = transaction.amount;
      this.transactionType = transaction.type;
      this.selectedCategory = transaction.category?.id || null;
      this.date_activity_happened = transaction.date_activity_happened;
      this.date_payment_happened = transaction.date_payment_happened;
  
      if (this.selectedCategory) {
        await this.loadSubcategories(this.selectedCategory); // Wacht tot de subcategorieën geladen zijn
        this.selectedSubcategory = transaction.subcategory?.id || null;
      } else {
        this.selectedSubcategory = null;
      }
  
      this.editingIndex = id;
    }
  }

  async updateTransaction(id: number, updatedData: Partial<Transaction>) {
    // Validatie van de velden
    if (!updatedData.description || !updatedData.description.trim()) {
      alert('Beschrijving is verplicht');
      return;
    }
    if ((updatedData.amount ?? 0) <= 0) {
      alert('Bedrag moet groter dan 0 zijn');
      return;
    }
    if (!updatedData.category) {
      alert('Categorie is verplicht');
      return;
    }
    if (!updatedData.subcategory) {
      alert('Subcategorie is verplicht');
      return;
    }

    await this.transactionService.updateTransaction(id, updatedData);
  
    const index = this.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      this.transactions[index] = { 
        ...this.transactions[index], //Behoud bestaande waarden
        ...updatedData,               //Overschrijf met nieuwe waarden
        category: this.categories.find(cat => cat.id === updatedData.category?.id) || null,
        subcategory: this.subcategories.find(subcat => subcat.id === updatedData.subcategory?.id) || null  
      };
      //console.log("test1:", this.transactions[index].category, this.transactions[index].subcategory);
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
  }

  async loadSubcategories(categoryId: number) {
    const { data, error } = await this.supabaseService.client
      .from("categories")
      .select("id, name")
      .eq("parent_id", categoryId);
  
    if (error) {
      console.error("Error fetching subcategories:", error);
    } else {
      this.subcategories = data || [];
      console.log("Subcategories loaded:", this.subcategories);
    }
  }

  onCategoryChange() {
    if (this.selectedCategory) {
      this.loadSubcategories(this.selectedCategory);
    } else {
      this.subcategories = []; // Leeg de subcategorieën als er geen categorie is geselecteerd
    }
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === Number(categoryId));
    return category ? category.name : '';
  }

  getSubcategoryName(subcategoryId: number): string {
    const subcategory = this.subcategories.find(subcat => subcat.id === Number(subcategoryId));
    return subcategory ? subcategory.name : '';
  }
}