FactoryBot.define do
  factory :question do
    happening
    title
    category { :string }
    mandatory { true }
  end
end
