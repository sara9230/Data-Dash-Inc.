import java.io.*;
import java.util.*;

public class DatabaseManager {
    private String filename;
    
    public DatabaseManager(String filename) {
        this.filename = filename;
    }
    
    public List<CatalogItem> loadItems() {
        List<CatalogItem> items = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new FileReader(filename))) {
            String line = br.readLine(); // Skip header
            while ((line = br.readLine()) != null) {
                String[] parts = line.split(",", 3);
                if (parts.length == 3) {
                    items.add(new CatalogItem(parts[0], parts[1], parts[2]));
                }
            }
        } catch (FileNotFoundException e) {
            System.out.println("Database file not found. Creating new one...");
            createDefaultDatabase();
        } catch (IOException e) {
            System.out.println("Error reading database: " + e.getMessage());
        }
        return items;
    }
    
    public void saveItems(List<CatalogItem> items) {
        try (PrintWriter pw = new PrintWriter(new FileWriter(filename))) {
            pw.println("ID,Name,Description");
            for (CatalogItem item : items) {
                pw.println(item.toCSV());
            }
            System.out.println("\nChanges saved successfully!");
        } catch (IOException e) {
            System.out.println("Error saving database: " + e.getMessage());
        }
    }
    
    private void createDefaultDatabase() {
        try (PrintWriter pw = new PrintWriter(new FileWriter(filename))) {
            pw.println("ID,Name,Description");
            pw.println("1,Laptop,High-performance laptop for work");
            pw.println("2,Mouse,Wireless optical mouse");
            pw.println("3,Keyboard,Mechanical gaming keyboard");
        } catch (IOException e) {
            System.out.println("Error creating database: " + e.getMessage());
        }
    }
}
