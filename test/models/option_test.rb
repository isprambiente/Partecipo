# frozen_string_literal: true

require "test_helper"

class OptionTest < ActiveSupport::TestCase
 test " valid from factory" do
    option = build :option
    assert option.valid?
    assert option.save
  end

  # relations
  test "belongs to question" do
    option = create :option
    assert_equal "Question", option.question.class.name
  end

  # validations
  test "presence of title" do
    option = build :option, title: ""
    assert_not option.valid?
    option.title = "ok"
    assert option.valid?
    assert option.save
  end

  test "presence of weight" do
    option = build :option, weight: nil
    assert_not option.valid?
    option.weight = 1
    assert option.valid?
    assert option.save
  end

  test "presence of acceptable" do
    option = build :option, acceptable: nil
    assert_not option.valid?
    option.acceptable = false
    assert option.valid?
    option.acceptable = true
    assert option.valid?
    assert option.save
  end

  # Scope
  test "default scope is weight desc" do
    o0 = create :option, weight: 0
    o1 = create :option, weight: 1
    o2 = create :option, weight: 2
    assert_equal Option.all.first, o2
    assert_equal Option.all.limit(2).last, o1
    assert_equal Option.all.last, o0
  end

  test "scope acceptable filter where acceptable is true" do
    question = create :question
    create :option, question: question, acceptable: true
    create :option, question: question, acceptable: false
    assert_equal question.options.count, 2
    assert_equal question.options.acceptable.count, 1
  end
end
