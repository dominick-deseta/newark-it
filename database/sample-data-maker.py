import random
import datetime
from faker import Faker
import decimal

# Initialize Faker
fake = Faker()

# Set the number of records to generate for each table
num_customers = 50
num_products = 100
num_baskets = 70
min_products_per_basket = 1
max_products_per_basket = 5

# Output file
output_file = "sample_data.sql"

# Clear the output file
with open(output_file, "w") as f:
    f.write("-- Newark-IT Sample Data\n\n")

# More realistic shipping address names
realistic_address_names = [
    "Home", "Work", "Mom's House", "Dad's House", "Beach House", "Vacation Home", 
    "Office", "P.O. Box", "Country Home", "Apartment", "Dorm Room", "Summer House",
    "In-Laws", "Cabin", "Lake House", "City Apartment", "Parent's House", 
    "Rental Property", "Brother's Place", "Sister's Place", "Winter Home", 
    "Mailbox Plus", "UPS Store", "Main Residence", "Second Home", "Business Address"
]

# More descriptive product categories and specifications
product_categories = {
    "Desktop": [
        "Gaming PC", "Office Workstation", "Design Station", "Compact Desktop", "All-in-One",
        "Mini PC", "Multimedia Desktop", "Business Desktop", "Home PC", "Professional Workstation"
    ],
    "Laptop": [
        "Gaming Laptop", "Ultrabook", "2-in-1 Convertible", "Business Laptop", "Student Laptop",
        "Professional Notebook", "Chromebook", "Graphics Workstation", "Budget Laptop", "Premium Laptop"
    ],
    "Printer": [
        "Color Laser", "Monochrome Laser", "Photo Printer", "All-in-One", "Document Scanner",
        "Label Printer", "Wide Format", "3D Printer", "Portable Printer", "Thermal Printer"
    ],
    "Accessory": [
        "Wireless Mouse", "Mechanical Keyboard", "External Hard Drive", "USB Hub", "Webcam",
        "Monitor", "Headset", "Graphics Tablet", "Docking Station", "Speakers",
        "Surge Protector", "UPS Battery Backup", "Laptop Cooling Pad", "WiFi Extender"
    ]
}

brand_names = [
    "TechPro", "EliteBook", "NexGen", "InnovateTech", "Comptech", "FutureSys", 
    "OmniComp", "PrimeWare", "DigitalEdge", "CoreTech", "AlphaSys", "CrystalView", 
    "BlueChip", "MegaByte", "QuantumTech", "SilverStream", "VertexSys", "ByteForce",
    "TitanWare", "PulseTech", "NovaComp", "DataFlow", "MatrixPC", "UniTech"
]

# Helper function to sanitize strings for SQL
def sanitize_for_sql(text):
    if text is None:
        return "NULL"
    return text.replace("'", "''").replace("\n", " ")

# Generate standardized phone number
def generate_standardized_phone():
    """Generate a phone number in the format: +X (XXX) XXX-XXXX"""
    country_code = random.randint(1, 99)  # Allow for two-digit country codes
    area_code = random.randint(100, 999)
    first_part = random.randint(100, 999)
    second_part = random.randint(1000, 9999)
    return f"+{country_code} ({area_code}) {first_part}-{second_part}"

# Helper functions
def generate_realistic_product_name(ptype):
    brand = random.choice(brand_names)
    category = random.choice(product_categories[ptype])
    model = f"{random.choice(['Pro', 'Elite', 'Max', 'Ultra', 'Slim', 'Plus', 'X', 'S', 'Z'])}{random.randint(10, 9999)}"
    
    return f"{brand} {category} {model}"

def generate_realistic_product_description(ptype, name):
    if ptype == "Desktop":
        descriptions = [
            f"High-performance {name} with advanced cooling system for intensive tasks.",
            f"Sleek and powerful {name} designed for professional environments.",
            f"Compact yet powerful {name} that saves space without compromising performance.",
            f"Ultimate gaming experience with the {name}, featuring customizable RGB lighting.",
            f"Expandable {name} with multiple upgrade options for future-proofing your investment."
        ]
    elif ptype == "Laptop":
        descriptions = [
            f"Lightweight and portable {name} with all-day battery life.",
            f"Premium {name} featuring a vivid display and immersive audio.",
            f"Versatile {name} with touchscreen capabilities for enhanced productivity.",
            f"Rugged {name} built to withstand demanding environments.",
            f"Slim {name} with military-grade durability and biometric security features."
        ]
    elif ptype == "Printer":
        descriptions = [
            f"High-speed {name} with wireless connectivity for seamless printing.",
            f"Efficient {name} with eco-friendly ink system that reduces waste.",
            f"Versatile {name} that handles multiple paper sizes and types.",
            f"Professional-grade {name} for stunning photo and document output.",
            f"Compact {name} perfect for home offices with limited space."
        ]
    else:  # Accessory
        descriptions = [
            f"Essential {name} designed for maximum comfort and productivity.",
            f"Premium {name} with ergonomic design for extended use.",
            f"High-performance {name} built for professionals and enthusiasts.",
            f"Sleek and modern {name} that complements any workspace.",
            f"Durable {name} with advanced features for everyday use."
        ]
    
    desc = random.choice(descriptions)
    features = f" Features include {random.choice(['fast connectivity', 'customizable settings', 'energy efficiency', 'compact design', 'noise reduction technology'])} and {random.choice(['premium materials', 'intuitive controls', 'automatic functionality', 'extended warranty', 'award-winning design'])}."
    
    return desc + features

def generate_customers():
    sql = "-- Insert CUSTOMER data\n"
    customer_ids = []
    
    for i in range(1, num_customers + 1):
        cid = i
        fname = sanitize_for_sql(fake.first_name())
        lname = sanitize_for_sql(fake.last_name())
        email = sanitize_for_sql(fake.email())
        address = sanitize_for_sql(fake.address().replace("\n", ", "))
        phone = sanitize_for_sql(generate_standardized_phone())
        status = random.choice(['regular', 'silver', 'gold', 'platinum'])
        
        sql += f"INSERT INTO CUSTOMER (CID, FName, LName, EMail, Address, Phone, Status) VALUES ({cid}, '{fname}', '{lname}', '{email}', '{address}', '{phone}', '{status}');\n"
        customer_ids.append((cid, status))
    
    return sql, customer_ids

def generate_silver_and_above(customer_ids):
    sql = "\n-- Insert SILVER_AND_ABOVE data\n"
    
    for cid, status in customer_ids:
        if status in ['silver', 'gold', 'platinum']:
            credit_line = round(random.uniform(500, 5000), 2)
            sql += f"INSERT INTO SILVER_AND_ABOVE (CID, CreditLine) VALUES ({cid}, {credit_line});\n"
    
    return sql

def generate_shipping_addresses(customer_ids):
    sql = "\n-- Insert SHIPPING_ADDRESS data\n"
    shipping_addresses = []
    
    for cid, _ in customer_ids:
        num_addresses = random.randint(1, 3)
        # Get a random sample of address names without repetition
        address_names = random.sample(realistic_address_names, num_addresses)
        
        for j in range(num_addresses):
            sa_name = sanitize_for_sql(address_names[j])
            recipient = sanitize_for_sql(fake.name())
            street = sanitize_for_sql(fake.street_name())
            snumber = sanitize_for_sql(fake.building_number())
            city = sanitize_for_sql(fake.city())
            zip_code = sanitize_for_sql(fake.zipcode())
            state = sanitize_for_sql(fake.state())
            country = sanitize_for_sql(fake.country())
            
            sql += f"INSERT INTO SHIPPING_ADDRESS (CID, SAName, RecipientName, Street, SNumber, City, Zip, State, Country) VALUES ({cid}, '{sa_name}', '{recipient}', '{street}', '{snumber}', '{city}', '{zip_code}', '{state}', '{country}');\n"
            shipping_addresses.append((cid, sa_name))
    
    return sql, shipping_addresses

def generate_credit_cards(customer_ids):
    sql = "\n-- Insert CREDIT_CARD data\n"
    cc_numbers = []
    
    for cid, _ in customer_ids:
        num_cards = random.randint(1, 2)
        
        for j in range(num_cards):
            cc_number = sanitize_for_sql(fake.credit_card_number().replace("-", "").replace(" ", ""))
            sec_number = sanitize_for_sql(str(random.randint(100, 999)))
            owner_name = sanitize_for_sql(fake.name())
            cc_type = sanitize_for_sql(random.choice(['Visa', 'MasterCard', 'American Express', 'Discover']))
            bil_address = sanitize_for_sql(fake.address().replace("\n", ", "))
            exp_date = fake.future_date(end_date='+3y').strftime('%Y-%m-%d')
            
            sql += f"INSERT INTO CREDIT_CARD (CCNumber, SecNumber, OwnerName, CCType, BilAddress, ExpDate, StoredCardCID) VALUES ('{cc_number}', '{sec_number}', '{owner_name}', '{cc_type}', '{bil_address}', '{exp_date}', {cid});\n"
            cc_numbers.append(cc_number)
    
    return sql, cc_numbers

def generate_products():
    sql = "\n-- Insert PRODUCT data\n"
    product_ids = []
    computer_ids = []
    printer_ids = []
    laptop_ids = []
    
    for i in range(1, num_products + 1):
        pid = i
        ptype = sanitize_for_sql(random.choice(['Desktop', 'Laptop', 'Printer', 'Accessory']))
        pname = sanitize_for_sql(generate_realistic_product_name(ptype))
        pprice = round(random.uniform(100, 3000), 2)
        pdescription = sanitize_for_sql(generate_realistic_product_description(ptype, pname))
        pquantity = random.randint(5, 100)
        
        sql += f"INSERT INTO PRODUCT (PID, PType, PName, PPrice, PDescription, PQuantity) VALUES ({pid}, '{ptype}', '{pname}', {pprice}, '{pdescription}', {pquantity});\n"
        product_ids.append((pid, ptype, pprice))
        
        if ptype == 'Desktop' or ptype == 'Laptop':
            computer_ids.append(pid)
        if ptype == 'Printer':
            printer_ids.append(pid)
        if ptype == 'Laptop':
            laptop_ids.append(pid)
    
    return sql, product_ids, computer_ids, printer_ids, laptop_ids

def generate_computers(computer_ids):
    sql = "\n-- Insert COMPUTER data\n"
    
    for pid in computer_ids:
        cpu_type = sanitize_for_sql(random.choice(['Intel i3', 'Intel i5', 'Intel i7', 'Intel i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9']))
        sql += f"INSERT INTO COMPUTER (PID, CPUType) VALUES ({pid}, '{cpu_type}');\n"
    
    return sql

def generate_printers(printer_ids):
    sql = "\n-- Insert PRINTER data\n"
    
    for pid in printer_ids:
        printer_type = sanitize_for_sql(random.choice(['Laser', 'Inkjet', 'All-in-One', '3D']))
        resolution = sanitize_for_sql(f"{random.choice(['600x600', '1200x1200', '2400x1200', '4800x1200'])} dpi")
        sql += f"INSERT INTO PRINTER (PID, PrinterType, Resolution) VALUES ({pid}, '{printer_type}', '{resolution}');\n"
    
    return sql

def generate_laptops(laptop_ids):
    sql = "\n-- Insert LAPTOP data\n"
    
    for pid in laptop_ids:
        btype = sanitize_for_sql(random.choice(['Lithium Ion', 'Lithium Polymer', 'Nickel Cadmium']))
        weight = round(random.uniform(0.8, 3.5), 2)
        sql += f"INSERT INTO LAPTOP (PID, BType, Weight) VALUES ({pid}, '{btype}', {weight});\n"
    
    return sql

def generate_offer_products(product_ids):
    sql = "\n-- Insert OFFER_PRODUCT data\n"
    
    # Offer about 20% of products
    num_offers = len(product_ids) // 5
    offer_products = random.sample(product_ids, num_offers)
    
    for pid, _, pprice in offer_products:
        # Discount between 10% and 30%
        discount = round(random.uniform(0.1, 0.3), 2)
        offer_price = round(pprice * (1 - discount), 2)
        sql += f"INSERT INTO OFFER_PRODUCT (PID, OfferPrice) VALUES ({pid}, {offer_price});\n"
    
    return sql

def generate_baskets_and_transactions(customer_ids, product_ids, shipping_addresses, cc_numbers):
    basket_sql = "\n-- Insert BASKET data\n"
    appears_in_sql = "\n-- Insert APPEARS_IN data\n"
    transaction_sql = "\n-- Insert TRANSACTION data\n"
    
    for i in range(1, num_baskets + 1):
        bid = i
        # Randomly select a customer
        cid, _ = random.choice(customer_ids)
        
        basket_sql += f"INSERT INTO BASKET (BID, CID) VALUES ({bid}, {cid});\n"
        
        # Get shipping addresses for this customer
        customer_addresses = [addr for addr in shipping_addresses if addr[0] == cid]
        if not customer_addresses:
            continue
            
        # Randomly select products for this basket
        num_products_in_basket = random.randint(min_products_per_basket, max_products_per_basket)
        basket_products = random.sample(product_ids, num_products_in_basket)
        
        for pid, _, pprice in basket_products:
            quantity = random.randint(1, 3)
            price_sold = round(pprice * random.uniform(0.9, 1.1), 2)  # Some price variation
            appears_in_sql += f"INSERT INTO APPEARS_IN (BID, PID, Quantity, PriceSold) VALUES ({bid}, {pid}, {quantity}, {price_sold});\n"
        
        # Create a transaction for this basket (80% chance)
        if random.random() < 0.8:
            # Randomly select a credit card
            cc_number = random.choice(cc_numbers)
            # Randomly select a shipping address for this customer
            cid, sa_name = random.choice(customer_addresses)
            # Generate a random date within the past year
            t_date = (datetime.datetime.now() - datetime.timedelta(days=random.randint(1, 365))).strftime('%Y-%m-%d %H:%M:%S')
            t_tag = sanitize_for_sql(random.choice(['delivered', 'not-delivered']) if random.random() < 0.9 else 'not-delivered')
            
            transaction_sql += f"INSERT INTO TRANSACTION (BID, CCNumber, CID, SAName, TDate, TTag) VALUES ({bid}, '{cc_number}', {cid}, '{sa_name}', '{t_date}', '{t_tag}');\n"
    
    return basket_sql, appears_in_sql, transaction_sql

# Generate the data
customer_sql, customer_ids = generate_customers()
silver_and_above_sql = generate_silver_and_above(customer_ids)
shipping_address_sql, shipping_addresses = generate_shipping_addresses(customer_ids)
credit_card_sql, cc_numbers = generate_credit_cards(customer_ids)
product_sql, product_ids, computer_ids, printer_ids, laptop_ids = generate_products()
computer_sql = generate_computers(computer_ids)
printer_sql = generate_printers(printer_ids)
laptop_sql = generate_laptops(laptop_ids)
offer_product_sql = generate_offer_products(product_ids)
basket_sql, appears_in_sql, transaction_sql = generate_baskets_and_transactions(customer_ids, product_ids, shipping_addresses, cc_numbers)

# Write all SQL to file
with open(output_file, "a") as f:
    f.write(customer_sql)
    f.write(silver_and_above_sql)
    f.write(shipping_address_sql)
    f.write(credit_card_sql)
    f.write(product_sql)
    f.write(computer_sql)
    f.write(printer_sql)
    f.write(laptop_sql)
    f.write(offer_product_sql)
    f.write(basket_sql)
    f.write(appears_in_sql)
    f.write(transaction_sql)

print(f"Sample data has been generated and saved to {output_file}")