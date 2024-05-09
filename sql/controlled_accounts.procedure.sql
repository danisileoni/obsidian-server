create or replace procedure controlled_accounts (quantity numeric, account_id uuid, order_id uuid, quantity_accounts numeric, type_account text) as $$
declare

begin
	begin
		execute format('
			update account 
			set 
				%I = ($1 - $2)
			where "id" = $3;
		', type_account)
		using quantity_accounts, quantity, account_id;

	exception
		when others then
			rollback;
			raise exception 'ERROR';

		end;
end;
$$ language plpgsql;