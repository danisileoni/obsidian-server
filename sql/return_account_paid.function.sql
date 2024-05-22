create or replace function return_accounts_paid (order_id numeric) 
returns table (email text, "password" text, product_name text, type_account text, platform_name text, image_url text, id_account uuid)
as $$
declare
	index_record RECORD;
	index_primary_record RECORD;
	index_secondary_record RECORD;
	index_one_account_record RECORD;
begin
	
	CREATE TEMP TABLE temp_table (email text, "password" text, product_name text, type_account text, platform_name text, image_url text, id_account uuid) ON COMMIT DROP;
	
	for index_record in 
		select *
		from orders_details
		cross join product_materialized
		where "orderId" = $1 and product_materialized."product_id" = orders_details."productId"
	loop
		if((index_record."namePlatform" = 'Play Station 4') or 
			(index_record."namePlatform" = 'Play Station 5')) then
			if (index_record."quantityPrimary" > 0) then
				for index_primary_record in 
					select
						*
					from account
					where 
						"productId" = index_record."product_id" and
						("quantityPrimary" > 0) and 
						(("typeAccount" = 'Play Station 4') or ("typeAccount" = 'Play Station 5'))
					order by "quantityPrimary" asc
					limit index_record."quantityPrimary"
				loop 
					call controlled_accounts (1, index_primary_record."id", index_primary_record."quantityPrimary", 'quantityPrimary');
				
					insert into temp_table (email, "password", product_name, type_account, platform_name, image_url, id_account) 
					values (index_primary_record."email", index_primary_record."password", index_record."title", 'Primaria', index_record."namePlatform", index_record."url", index_primary_record."id");
				end loop;
			end if;
		
			if (index_record."quantitySecondary" > 0) then
				for index_secondary_record in 
					select
						*
					from account
					where 
						"productId" = index_record."product_id" and
						("quantitySecondary" > 0) and 
						(("typeAccount" = 'Play Station 4') or ("typeAccount" = 'Play Station 5'))
					order by "quantitySecondary" asc
					limit index_record."quantitySecondary"
				loop 
					call controlled_accounts (1, index_secondary_record."id", index_secondary_record."quantitySecondary", 'quantitySecondary');
				
					insert into temp_table (email, "password", product_name, type_account, platform_name, image_url, id_account) 
					values (index_secondary_record."email", index_secondary_record."password", index_record."title", 'Secundaria', index_record."namePlatform", index_record."url", index_secondary_record."id");
				end loop;
			end if;
		end if;
		
		if (index_record."namePlatform" = 'Steam') then
			for index_one_account_record in 
				select
					*
				from account
				where 
					"productId" = index_record."product_id" and "typeAccount" = index_record."namePlatform"
				limit 1
			loop 
				insert into temp_table (email, "password", product_name, type_account, platform_name, image_url, id_account) 
				values (index_one_account_record."email", index_one_account_record."password", index_record."title", index_record."namePlatform", index_record."namePlatform", index_record."url", index_one_account_record."id");
			end loop;
		end if;
		
	end loop;
	return query select * from temp_table;
end;

$$ language plpgsql;