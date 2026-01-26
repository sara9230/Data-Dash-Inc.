import java.util.Scanner;

public class FrontEnd {
    private BackendLogic backend;
    private DatabaseManager dbManager;
    private Scanner scanner;
    
    public FrontEnd(BackendLogic backend, DatabaseManager dbManager) {
        this.backend = backend;
        this.dbManager = dbManager;
        this.scanner = new Scanner(System.in);
    }
    
    public void run() {
        System.out.println("=== Catalog Management System ===\n");
        
        boolean running = true;
        while (running) {
            displayMenu();
            String choice = scanner.nextLine();
            
            switch (choice) {
                case "1":
                    viewAllItems();
                    break;
                case "2":
                    viewItemDetails();
                    break;
                case "3":
                    addNewItem();
                    break;
                case "4":
                    editExistingItem();
                    break;
                case "5":
                    saveAndExit();
                    running = false;
                    break;
                default:
                    System.out.println("Invalid option. Please try again.\n");
            }
        }
        
        scanner.close();
    }
    
    private void displayMenu() {
        System.out.println("\n--- Main Menu ---");
        System.out.println("1. View All Items");
        System.out.println("2. View Item Details");
        System.out.println("3. Add New Item");
        System.out.println("4. Edit Item");
        System.out.println("5. Save and Exit");
        System.out.print("Enter your choice: ");
    }
    
    private void viewAllItems() {
        System.out.println("\n=== Catalog Items ===");
        for (CatalogItem item : backend.getItems()) {
            System.out.println(item);
        }
    }
    
    private void viewItemDetails() {
        System.out.print("\nEnter Item ID: ");
        String id = scanner.nextLine();
        
        CatalogItem item = backend.getItemById(id);
        if (item != null) {
            System.out.println("\n--- Item Details ---");
            System.out.println(item);
        } else {
            System.out.println("Item not found!");
        }
    }
    
    private void addNewItem() {
        System.out.println("\n=== Add New Item ===");
        String id = backend.getNextId();
        System.out.println("Auto-generated ID: " + id);
        
        System.out.print("Enter name: ");
        String name = scanner.nextLine();
        
        System.out.print("Enter description: ");
        String description = scanner.nextLine();
        
        if (backend.addItem(id, name, description)) {
            System.out.println("Item added successfully!");
        }
    }
    
    private void editExistingItem() {
        System.out.println("\n=== Edit Item ===");
        System.out.print("Enter Item ID to edit: ");
        String id = scanner.nextLine();
        
        CatalogItem item = backend.getItemById(id);
        if (item == null) {
            System.out.println("Item not found!");
            return;
        }
        
        System.out.println("Current: " + item);
        System.out.print("Enter new name (current: " + item.getName() + "): ");
        String newName = scanner.nextLine();
        
        System.out.print("Enter new description (current: " + item.getDescription() + "): ");
        String newDescription = scanner.nextLine();
        
        if (backend.editItem(id, newName, newDescription)) {
            System.out.println("Item updated successfully!");
        }
    }
    
    private void saveAndExit() {
        dbManager.saveItems(backend.getItems());
        System.out.println("Goodbye!");
    }
}
