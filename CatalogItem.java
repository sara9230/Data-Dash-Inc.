public class CatalogItem {
    private String id;
    private String name;
    private String description;
    
    public CatalogItem(String id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }
    
    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    
    public String toCSV() {
        return id + "," + name + "," + description;
    }
    
    @Override
    public String toString() {
        return "ID: " + id + " | Name: " + name + " | Description: " + description;
    }
}
