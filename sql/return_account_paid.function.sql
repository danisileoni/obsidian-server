CREATE OR REPLACE FUNCTION return_accounts_paid(order_id numeric) 
RETURNS TABLE (email text, "password" text, product_name text, type_account text, platform_name text, image_url text, id_account uuid)
AS $$
DECLARE
    index_record RECORD;
    index_primary_record RECORD;
    index_secondary_record RECORD;
    index_one_account_record RECORD;
BEGIN
    
    CREATE TEMP TABLE temp_table (email text, "password" text, product_name text, type_account text, platform_name text, image_url text, id_account uuid) ON COMMIT DROP;
    
    FOR index_record IN 
        SELECT 
            (product_element->>'id')::int as productId, 
            od."orderId", 
            pm.title,
            pm."productImages"[1] as url,
            (product_element->'platform'->>'namePlatform') as namePlatform,
            od."quantityPrimary",
            od."quantitySecondary",
            od."quantitySteam"
        FROM 
            orders_details od
        CROSS JOIN 
            product_materialized pm,
            LATERAL jsonb_array_elements(pm.products) as product_element
        WHERE 
            od."orderId" = order_id
            AND (product_element->>'id')::int = od."productId"
    LOOP
        IF((index_record.namePlatform = 'PlayStation 4') OR 
            (index_record.namePlatform = 'PlayStation 5')) THEN
            IF (index_record."quantityPrimary" > 0) THEN
                FOR index_primary_record IN 
                    SELECT
                        *
                    FROM account
                    WHERE 
                        "productId" = index_record.productId AND
                        "quantityPrimary" > 0 AND 
                        ("typeAccount" = 'PlayStation 4' OR "typeAccount" = 'PlayStation 5')
                    ORDER BY "quantityPrimary" ASC
                    LIMIT index_record."quantityPrimary"
                LOOP 
                    CALL controlled_accounts (1, index_primary_record."id", index_primary_record."quantityPrimary", 'quantityPrimary');
                
                    INSERT INTO temp_table (email, "password", product_name, type_account, platform_name, image_url, id_account) 
                    VALUES (index_primary_record."email", index_primary_record."password", index_record.title, 'Primaria', index_record.namePlatform, index_record.url, index_primary_record."id");
                END LOOP;
            END IF;
        
            IF (index_record."quantitySecondary" > 0) THEN
                FOR index_secondary_record IN 
                    SELECT
                        *
                    FROM account
                    WHERE 
                        "productId" = index_record.productId AND
                        "quantitySecondary" > 0 AND 
                        ("typeAccount" = 'PlayStation 4' OR "typeAccount" = 'PlayStation 5')
                    ORDER BY "quantitySecondary" ASC
                    LIMIT index_record."quantitySecondary"
                LOOP 
                    CALL controlled_accounts (1, index_secondary_record."id", index_secondary_record."quantitySecondary", 'quantitySecondary');
                
                    INSERT INTO temp_table (email, "password", product_name, type_account, platform_name, image_url, id_account) 
                    VALUES (index_secondary_record."email", index_secondary_record."password", index_record.title, 'Secundaria', index_record.namePlatform, index_record.url, index_secondary_record."id");
                END LOOP;
            END IF;
        END IF;
        
        IF (index_record.namePlatform = 'Steam') THEN
            FOR index_one_account_record IN 
                SELECT
                    *
                FROM account
                WHERE 
                    "productId" = index_record.productId AND "typeAccount" = index_record.namePlatform
                LIMIT 1
            LOOP 
                INSERT INTO temp_table (email, "password", product_name, type_account, platform_name, image_url, id_account) 
                VALUES (index_one_account_record."email", index_one_account_record."password", index_record.title, index_record.namePlatform, index_record.namePlatform, index_record.url, index_one_account_record."id");
            END LOOP;
        END IF;
        
    END LOOP;
    RETURN QUERY SELECT * FROM temp_table;
END;
$$ LANGUAGE plpgsql;