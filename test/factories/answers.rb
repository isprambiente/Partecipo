FactoryBot.define do
  factory :answer do
    association :question, factory: :question, strategy: :create
    ticket { create(:ticket, happening: question.happening) }
    value { 'ok' }
    factory :answer_string do
      question { create :question, category: :string }
      value { 'MyText' }   
    end
    factory :answer_text do
      question { create :question, category: :text }
      value { 'MyText' }   
    end
    factory :answer_file do
      question { create :question, category: :file }
      value { '' }
      file { Rack::Test::UploadedFile.new('test/fixtures/files/Ruby_on_Rails-logo.png', 'image/png') }
    end
    factory :answer_select do
      question { create :question, category: :select, options_attributes: [{title: 'ok'}] }
      value { 'ok' }
    end
  end
end
