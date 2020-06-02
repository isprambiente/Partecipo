json.extract! admin_group, :id, :title, :user_ids, :created_at, :updated_at
json.url admin_group_url(admin_group, format: :json)
