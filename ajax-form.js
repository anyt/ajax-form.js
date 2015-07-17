/**
 * @author Andrey Yatsenco <yatsenco@gmail.com>
 */

(function ($) {
  'use strict';

  var AjaxForm = function (element, options) {
    this.$button = element;
    this.$form = $(element.form);

    $.extend(AjaxForm.options, options);

    $(document)
      .on('click', element, this.submit)
      .on('ajax.processed', element, this.process);
  };

  AjaxForm.prototype.options = {
    loadingText: 'Processing...',
    focusTarget: ':input:visible:first',
    errorMessage: 'Something went wrong.'
  };

  AjaxForm.prototype.actions = {
    redirect: function (response) {
      window.location.href = response.href;
    },
    reload: function () {
      location.reload();
    },
    jquery: function (response) {
      var $element = $(response.selector);
      $element[response.method].apply($element, response.params);
    }
  };

  AjaxForm.prototype.addAction = function (name, callback) {
    this.actions[name] = callback;
  };

  AjaxForm.prototype.addActions = function (actions) {
    $.each(actions, this.addAction);
  };

  AjaxForm.prototype.submit = function (event) {
    var that = this;
    var $button = this.$button;
    var $form = this.$form;

    // button loading state
    if (options.loadingText) {
      $button.text(options.loadingText).attr('disabled', 'disabled');
    }

    // ajax request
    $.ajax({
      type: "POST",
      url: $form.attr('action'),
      data: that.serializeForm(),
      cache: false,
      contentType: false,
      processData: false,
      success: that.success,
      error: that.error
    });

    // prevent normal form submission
    event.preventDefault();
  };

  AjaxForm.prototype.success = function (response, textStatus, xhr) {
    if (that.isFormProcessed(xhr)) {
      var ajaxSubmitEvent = $.Event('ajax.processed', {
        response: response
      });
      $button.trigger(ajaxSubmitEvent);
    }
    else {
      //render form with errors
      $form.replaceWith(response);

      // focus element in form
      if (options.focusTarget) {
        $(options.focusTarget, $newForm).focus();
      }
    }
  };

  AjaxForm.prototype.error = function (data) {
    alert(this.options.errorMessage);
    console.error(data);
    location.reload();
  };

  AjaxForm.prototype.process = function (event) {
    var $button = this.$button,
      response = event.response,
      action = response.action;

    if (typeof this.actions[action] !== "undefined") {
      this.actions[action](event.response);
    }
  };

  AjaxForm.prototype.isFormProcessed = function (xhr) {
    var that = this;
    var ct = xhr.getResponseHeader("content-type") || "";
    return (ct.indexOf('json') > -1);
  };

  // Serialize form with files
  AjaxForm.prototype.serializeForm = function () {
    var form = this.$form;
    var formData = new FormData();
    $.each($(form).find("input:file"), function (i, tag) {
      $.each($(tag)[0].files, function (i, file) {
        formData.append(tag.name, file);
      });
    });
    var params = $(form).serializeArray();
    $.each(params, function (i, val) {
      formData.append(val.name, val.value);
    });
    return formData;
  };

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('ajaxForm');
      var options = typeof option == 'object' && option;

      if (!data) $this.data('ajaxForm', (data = new AjaxForm(this, options)));
      if (typeof option == 'string') data[option]();
    })
  }

  $.fn.ajaxForm = Plugin;
  $.fn.ajaxForm.Constructor = AjaxForm;

}(jQuery));