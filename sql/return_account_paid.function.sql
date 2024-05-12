create or replace function return_accounts_paid (order_id uuid) 
returns table (email text, "password" text, product_name text, type_account text, image_url text, id uuid)
as $$
declare
	quantity numeric;
	index_record RECORD;
	index_primary_record RECORD;
	index_secondary_record RECORD;
	index_steam_record RECORD;
	title_product text;
	image_url text;
begin
	
	CREATE TEMP TABLE temp_table (email text, "password" text, product_name text, type_account text, image_url text, id uuid) ON COMMIT DROP;
	
	for index_record in 
		select *
		from orders_details
		where "orderId" = $1
	loop

		if (index_record."quantityPrimary" > 0) then
			for index_primary_record in 
				select
					*
				from account
				where 
					"productId" = index_record."productId" and
					("quantityPrimary" > 0)
				order by "quantityPrimary" asc
				limit index_record."quantityPrimary"
			loop 
				select product."title", product_image."url"
				into title_product, image_url
				from product
				inner join product_image on product.id = product_image."productId" 
				where product."id" = index_primary_record."productId";
				
				call controlled_accounts (1, index_primary_record."id", order_id, index_primary_record."quantityPrimary", 'quantityPrimary');
			
				insert into temp_table (email, "password", product_name, type_account, image_url, id) 
				values (index_primary_record."email", index_primary_record."password", title_product, 'Primary', image_url, index_primary_record."id");
			end loop;
		end if;
		
		if (index_record."quantitySecondary" > 0) then
			for index_secondary_record in 			
				select
					*
				from account
				where 
					"productId" = index_record."productId" and 
					("quantitySecondary" > 0)
				order by "quantitySecondary" asc
				limit index_record."quantitySecondary"
			loop 
				select product."title", product_image."url"
				into title_product, image_url
				from product
				inner join product_image on product.id = product_image."productId" 
				where product."id" = index_primary_record."productId";
				
				call controlled_accounts (1, index_secondary_record."id", order_id, index_secondary_record."quantitySecondary", 'quantitySecondary');
			
				insert into temp_table (email, "password", product_name, type_account, image_url, id) 
				values (index_secondary_record."email", index_secondary_record."password", title_product, 'Secondary', image_url, index_secondary_record."id");
			end loop;
		end if;
		
		if (index_record."quantitySteam" > 0) then 
			for index_steam_record in 			
				select
					*
				from account
				where 
					"productId" = index_record."productId"
				limit 1
			loop 
				select product."title", product_image."url"
				into title_product, image_url
				from product
				inner join product_image on product.id = product_image."productId" 
				where product."id" = index_primary_record."productId";
			
				insert into temp_table (email, "password", product_name, type_account, image_url, id) 
				values (index_steam_record."email", index_steam_record."password", title_product, 'Steam', image_url, index_steam_record."id");
			end loop;
		end if;
		
	end loop;
	return query select * from temp_table;
end;

$$ language plpgsql;