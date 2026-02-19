-- Ver los valores permitidos del ENUM paymentMethod
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value,
    e.enumsortorder
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%payment%'
ORDER BY t.typname, e.enumsortorder;
