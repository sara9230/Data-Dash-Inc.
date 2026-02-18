import java.util.*;

public class BackendLogic {
    private List<CatalogItem> items;
    
    public BackendLogic(List<CatalogItem> items) {
        this.items = items;
    }
    
    public List<CatalogItem> getItems() {
        return items;
    }
    
    public CatalogItem getItemById(String id) {
        for (CatalogItem item : items) {
            if (item.getId().equals(id)) {
                return item;
            }
        }
        return null;
    }
    
    public boolean addItem(String id, String name, String description) {
        if (!validateInput(name, description)) {
            return false;
        }
        
        if (getItemById(id) != null) {
            System.out.println("Error: Item with ID " + id + " already exists!");
            return false;
        }
        
        items.add(new CatalogItem(id, name, description));
        return true;
    }
    
    public boolean editItem(String id, String newName, String newDescription) {
        if (!validateInput(newName, newDescription)) {
            return false;
        }
        
        CatalogItem item = getItemById(id);
        if (item == null) {
            System.out.println("Error: Item not found!");
            return false;
        }
        
        item.setName(newName);
        item.setDescription(newDescription);
        return true;
    }
    
    private boolean validateInput(String name, String description) {
        if (name == null || name.trim().isEmpty()) {
            System.out.println("Error: Name cannot be empty!");
            return false;
        }
        if (description == null || description.trim().isEmpty()) {
            System.out.println("Error: Description cannot be empty!");
            return false;
        }
        return true;
    }
    
    public String getNextId() {
        int maxId = 0;
        for (CatalogItem item : items) {
            try {
                int id = Integer.parseInt(item.getId());
                if (id > maxId) maxId = id;
            } catch (NumberFormatException e) {
                // Skip non-numeric IDs
            }
        }
        return String.valueOf(maxId + 1);
    }
}
