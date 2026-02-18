import java.util.*;

public class CatalogManagementSystem {
    public static void main(String[] args) {
        String dbFile = "catalog.csv";
        
        // Initialize components
        DatabaseManager dbManager = new DatabaseManager(dbFile);
        List<CatalogItem> items = dbManager.loadItems();
        BackendLogic backend = new BackendLogic(items);
        FrontEnd frontend = new FrontEnd(backend, dbManager);
        
        // Run the application
        frontend.run();
    }
    
}