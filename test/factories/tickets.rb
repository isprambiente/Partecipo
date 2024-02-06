# frozen_string_literal: true

FactoryBot.define do
  factory :ticket do
    happening
    user
    factory :ticket_answer_string do
      answers_attributes { [{value: 'MyText', question: create(:question, category: :string, happening: , mandatory: true)}]}
    end
    factory :ticket_answer_text do
      answers_attributes { [{value: 'MyText', question: create(:question, category: :text, happening: , mandatory: true)}]}
    end
    factory :ticket_answer_file do
      answers_attributes { [{file: Rack::Test::UploadedFile.new('test/fixtures/files/Ruby_on_Rails-logo.png', 'image/png'), question: create(:question, category: :file, happening: , mandatory: true)}]}
    end
    factory :ticket_answer_select do
      answers_attributes { [{value: 'ok', question: create(:question, category: :select, options_attributes: [{title: 'ok'}], happening: , mandatory: true)}]}
    end

  end
end
