require "test_helper"

class QuestionTest < ActiveSupport::TestCase
  test 'valid from factory' do
    question = build :question
    assert question.valid?
    assert question.save
  end

  # relations
  test 'belongs to happening' do
    question = create :question
    assert_equal 'Happening', question.happening.class.name
  end

  test 'has many options' do
    question = create :question
    assert_equal 'ActiveRecord::Associations::CollectionProxy', question.options.class.name
    assert_equal 'Option', question.options.new.class.name
  end

  test 'has many answers' do
    question = create :question
    assert_equal 'ActiveRecord::Associations::CollectionProxy', question.answers.class.name
    assert_equal 'Answer', question.answers.new.class.name
  end

  # validations
  test 'title is required' do
    question = build :question, title: nil
    assert_not question.valid?
    question.title = ''
    assert_not question.valid?
    question.title = 'ok'
    assert question.valid?
    assert question.save
  end

  test 'weight is required' do
    question = build :question, weight: nil
    assert_not question.valid?
    question.weight = ''
    assert_not question.valid?
    question.weight = 1
    assert question.valid?
    assert question.save
  end

  test 'category is required' do
    question = build :question, category: nil
    assert_not question.valid?
    question.category = ''
    assert_not question.valid?
    question.category = 'string'
    assert question.valid?
    assert question.save
  end

  # enum
  test 'category is enum' do
    assert Question.defined_enums.key?('category')
  end

  # Scope
  test 'scope by_weight' do
    create :question, weight: 0
    create :question, weight: 10
    assert_equal Question.by_weight.first.weight, 10
    assert_equal Question.by_weight.last.weight, 0
  end

  test 'default scope is by_weight' do
    create :question, weight: 0
    create :question, weight: 10
    assert_equal Question.first.weight, 10
    assert_equal Question.last.weight, 0
  end
end
